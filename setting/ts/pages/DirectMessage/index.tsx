import ChatBox from '@components/ChatBox';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useInput';
import useSocket from '@hooks/useSocket';
import { Container, Header, DragOver } from '@pages/DirectMessage/styles';
import { IDM } from '@typings/db';
import fetcher from '@utils/fetcher';
import makeSection from '@utils/makeSection';
import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import gravatar from 'gravatar';
import Scrollbars from 'react-custom-scrollbars';
import { useParams } from 'react-router';
import useSWR, { useSWRInfinite } from 'swr';

const DirectMessage = () => {
  const { workspace, id } = useParams<{ workspace: string; id: string }>();
  const { data: userData } = useSWR(`/api/workspaces/${workspace}/users/${id}`, fetcher);
  const { data: myData } = useSWR('/api/users', fetcher);
  const [chat, onChangeChat, setChat] = useInput('');

  // useSWRInfinite: inifinite scrolling 전용 메서드, index는 페이지, setSize는 페이지 수를 바꿔주는 것
  const {
    data: chatData,
    mutate: mutateChat,
    revalidate,
    setSize,
  } = useSWRInfinite<IDM[]>(
    (index: number) => `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=${index + 1}`,
    fetcher,
  );

  // useSWRInfinite를 사용하면 2차원 배열로 받아옴
  // 처음엔 이렇게 불러오다가 [[{id: 3}, {id: 4}]]
  // 그 다음 페이지에선 이렇게 불러옴 [[{id: 1}, {id: 2}], [{id: 3}, {id: 4}]]
  // 최신 데이터가 앞에 붙음!

  const [socket] = useSocket(workspace);

  // infinite scrolling 할 땐 이 두개의 변수를 선언해 주는게 좋음
  const isEmpty = chatData?.[0]?.length === 0;

  // empty는 아니지만 데이터를 20개 보다 적게 가져왔다 == 다 가져왔다
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false;
  // 채팅을 하다가 잠깐 스크롤 올렸다가 채팅하다가 엔터 눌렀을 경우 스크롤이 내려와서 내가 지금 친 채팅이 보여야함
  const scrollbarRef = useRef<Scrollbars>(null);
  const [dragOver, setDragOver] = useState(false);

  const onSubmitForm = useCallback(
    (e: any) => {
      e.preventDefault();
      console.log(chat);
      if (chat?.trim() && chatData) {
        const savedChat = chat;
        // 채팅 입력 후 스크롤 다운을 하는데 약간의 딜레이가 느껴짐
        // 서버로 요청보낸 것이 성공되면 그 때 메시지를 보여주고 스크롤을 내리는 것 때문에 발생
        // 사용자 경험이 좋지 않을 수 있음
        // 그래서 서버쪽에 갔다오진 않았지만 마치 성공해서 데이터가 있는 것 마냥 먼저 UI에 데이터를 넣어 놓는다
        // 안정성보단 사용성을 더 중요시한 케이스
        mutateChat((prevChatData: any) => {
          // DM 객체
          prevChatData?.[0].unshift({
            id: (chatData[0][0]?.id || 0) + 1,
            content: savedChat,
            SenderId: myData.id,
            Sender: myData,
            ReceiverId: userData.id,
            Receiver: userData,
            createdAt: new Date(),
          });
          return prevChatData;
        }, false).then(() => {
          setChat('');
          // 채팅 치고 나면 스크롤 맨 아래로 이동시켜서 내가 친 메시지가 보이게끔
          scrollbarRef.current?.scrollToBottom();
        });

        axios
          .post(`/api/workspaces/${workspace}/dms/${id}/chats`, {
            content: chat,
          })
          .then(() => {
            revalidate();
          })
          .catch(console.error);
      }
    },
    [chat, chatData, myData, userData, workspace, id],
  );

  const onMessage = useCallback((data: IDM) => {
    // id는 상대방 아이디 내 아이디는 mutateChat 하지 않는다.
    // 60번째 라인에서도 mutateChat을 하기 때문에 두번 mutateChat을 하게 된다 -> 내 채팅이 두개 올라옴
    if (data.SenderId === Number(id) && myData.id !== Number(id)) {
      // socket.io가 서버로 부터 데이터를 실시간으로 가져온다
      // 그걸 굳이 서버에 다시 한번 더 요청 보낼 필요가 없다(revalidate 할 필요가 없다)
      // socket.io가 서버로 부터 새롭게 생성된 DM을 가져다주는데 그걸 믿고 가져다 쓰면 되지.
      // 그래서 그냥 mutateChat에서 가장 최신 배열에 가장 최신으로 데이터를 넣는다.
      // 그리고 스크롤바만 조정한다.

      mutateChat((chatData: any) => {
        chatData?.[0].unshift(data);
        return chatData;
      }, false).then(() => {
        if (scrollbarRef.current) {
          // 내가 입력 할 때는 스크롤바가 내려가고, 타인이 입력 할 때는 안내려 갔으면 좋겠음
          // 그래서 150px 이하로 스크롤 올렸을 경우 타인이 메시지를 보내면 스크롤이 내려가는데
          // 그게 아니면 타인이 메시지를 보내도 스크롤바가 내려가지 않도록함
          if (
            scrollbarRef.current.getScrollHeight() <
            scrollbarRef.current.getClientHeight() + scrollbarRef.current.getScrollTop() + 150
          ) {
            console.log('scrollToBottom!', scrollbarRef.current?.getValues());

            // 시크릿탭, 일반탭으로 테스트 해보면 일반 탭에서 a 계정이 보냈는데 시크릿탭을 클릭하면 바로 dm이 와야하는데
            // 몇초 정도 뒤에 b계정에 메시지가 도착함 그래서 시간 차이가 안맞아서? 딜레이줌
            setTimeout(() => {
              scrollbarRef.current?.scrollToBottom();
            }, 50);
          }
        }
      });
    }
  }, []);

  useEffect(() => {
    socket?.on('dm', onMessage);
    return () => {
      socket?.off('dm', onMessage);
    };
  }, [socket, onMessage]);

  // 로딩 시 스크롤바 제일 아래로
  useEffect(() => {
    // 채팅 데이터가 있어서 불러오는 경우에 가장 밑으로 스크롤 내림
    if (chatData?.length === 1) {
      setTimeout(() => {
        scrollbarRef.current?.scrollToBottom();
      }, 100);
    }
  }, [chatData]);

  const onDrop = useCallback(
    (e: any) => {
      e.preventDefault();
      console.log(e);
      const formData = new FormData();
      if (e.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
          // If dropped items aren't files, reject them
          if (e.dataTransfer.items[i].kind === 'file') {
            const file = e.dataTransfer.items[i].getAsFile();
            console.log('... file[' + i + '].name = ' + file.name);
            formData.append('image', file);
          }
        }
      } else {
        // Use DataTransfer interface to access the file(s)
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          console.log('... file[' + i + '].name = ' + e.dataTransfer.files[i].name);
          formData.append('image', e.dataTransfer.files[i]);
        }
      }
      axios.post(`/api/workspaces/${workspace}/dms/${id}/images`, formData).then(() => {
        setDragOver(false);
        revalidate();
      });
    },
    [revalidate, workspace, id],
  );

  const onDragOver = useCallback((e: any) => {
    e.preventDefault();
    console.log(e);
    setDragOver(true);
  }, []);

  if (!userData || !myData) {
    return null;
  }

  // [].concat(...chatData).reverse(): chatData가 거꾸로 보여지는 현상 때문에 immutable 하게 리버싱 시켜줌
  // 빈 배열에다가 chatData를 넣으면 새 배열이 생기고, 그걸 리버싱  하는 방법(concat이 immutable함)
  // [...chatData].reverse() 도 가능함!! spread를 쓰면 새로운 배열이됨
  // flat(): 2차원 배열을 1차원 배열로 만들어주는 함수, 내부가 얕은 복사라서 참조가 유지된다.
  // const a = {};
  // const b = {};
  // const x = [[a], [b]];
  // const y = x.flat();
  // console.log(y[0] === a)

  const chatSections = makeSection(chatData ? chatData.flat().reverse() : []);

  return (
    <Container onDrop={onDrop} onDragOver={onDragOver}>
      <Header>
        <img src={gravatar.url(userData.email, { s: '24px', d: 'retro' })} alt={userData.nickname} />
        <span>{userData.nickname}</span>
      </Header>
      <ChatList chatSections={chatSections} ref={scrollbarRef} setSize={setSize} isReachingEnd={isReachingEnd} />
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} />
      {dragOver && <DragOver>업로드!</DragOver>}
    </Container>
  );
};

export default DirectMessage;
