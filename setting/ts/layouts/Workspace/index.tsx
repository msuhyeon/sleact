import React, { useCallback, useEffect, useState, VFC } from 'react';
import useSWR from 'swr';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import { Redirect, useParams } from 'react-router';
// import { Redirect as abc } from "react-router"; // 이렇게 하면 Redirect를 abc로 개명해서 사용할 수 있다.
import {
  Channels,
  Chats,
  Header,
  LogOutButton,
  MenuScroll,
  ProfileImg,
  ProfileModal,
  RightMenu,
  WorkspaceButton,
  WorkspaceName,
  WorkspaceWrapper,
  AddButton,
  WorkspaceModal,
} from '@layouts/Workspace/styles';
import gravatar from 'gravatar';
import loadable from '@loadable/component';
import Menu from '@components/Menu';
import { Link, Route, Switch } from 'react-router-dom';
import { IUser, IChannel } from '@typings/db';
import { Modal } from '@components/Modal';
import { Button, Input, Label } from '@pages/SignUp/styles';
import useInput from '@hooks/useInput';
import { toast } from 'react-toastify';
import InviteWorkspaceModal from '@components/InviteWorkspaceModal';
import CreateChannelModal from '@components/CreateChannelModal';
import InviteChannelModal from '@components/InviteChannelModal';
import DMList from '@components/DMList';
import ChannelList from '@components/ChannelList';
import useSocket from '@hooks/useSocket';

const Channel = loadable(() => import('@pages/Channel'));
const DirectMessage = loadable(() => import('@pages/DirectMessage'));

// children을 쓰는 컴포넌트는 FC타입,  안쓰는 컴포넌트는 VFC가 타입
// FC라는 타입안에 children이 알아서 들어있다,
const Workspace: VFC = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);
  const [showInviteWorkspaceModal, setShowInviteWorkspaceModal] = useState(false);
  const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [newWorkspace, onChangeNewWorkspace, setNewWorkpsace] = useInput('');
  const [newUrl, onChangeNewUrl, setNewUrl] = useInput('');

  const { workspace } = useParams<{ workspace: string }>();

  // SWR을 이용해서 로컬스토리지의 데이터를 가져 올 수도 있음. 항상 비동기 요청이랑만 관련있는게 아님. 전역 데이터 관리자! -> 리덕스를 대체!!
  // const { data } = useSWR('hello', () => {localStorage.setItem('data', key); return localStorage.getItem('data) })

  // 같은 주소 인데 두 가지 fetcher를 쓰고싶다?
  // 주소에 쿼리 스트링이나 '/api/users#123' 이렇게 주소를 변형한다. 서버는 #을 무시하기 때문에 둘다 같은 주소로 보내는 요청으로 인식함

  // data를 userData로 개명시킴
  const {
    data: userData,
    error,
    mutate,
  } = useSWR<IUser | false>('/api/users', fetcher, {
    dedupingInterval: 2000, // 2초
  });

  //채널 데이터를 서버로 부터 받아옴
  const { data: channelData } = useSWR<IChannel[]>(userData ? `/api/workspaces/${workspace}/channels` : null, fetcher);

  // hook에서 필요한 데이터만 뽑아옴
  const [socket, disconnect] = useSocket(workspace);

  useEffect(() => {
    if (channelData && userData && socket) {
      // receiveBuffer는 항상 비어있어야한다. 뭔가 차 있으면 연결이 끊겨서 서버로 뭔갈 보내지 못하고 있단 뜻.
      // => 서버 쪽 에서도 연결이 끊겨 프론트에서 못받았던것을 receiveBuffer에 담아놨다가 다시 연결이 되면 그때 뿌려줌.
      // sendBuffer에다가 데이터를 쭉 모아놨다가 다시 연결이 되면 그 동안에 있었던 emit 했던 것 들을 보냄.
      // 중간에 데이터가 날라갈 거 걱정 안해도됨!!
      // _callbacks{} 에는 on 했던 list들이 들어가있음
      // socket.io에는 연결에 대한 옵션들이 있음
      console.log(socket);

      socket.emit('login', { id: userData.id, channels: channelData.map((v) => v.id) });
    }
  }, [socket, channelData, userData]); // 외부 변수들은 항상 deps에 넣어줘야함

  // workspace가 바뀌었으면 기존의 workspace를 제거
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [workspace, disconnect]);

  // SWR을 이용해서 로컬스토리지의 데이터를 가져 올 수도 있음. 항상 비동기 요청이랑만 관련있는게 아님. 전역 데이터 관리자! -> 리덕스를 대체!!
  // const { data } = useSWR('hello', () => {localStorage.setItem('data', key); return localStorage.getItem('data) })

  // 같은 주소 인데 두 가지 fetcher를 쓰고싶다?
  // 주소에 쿼리 스트링이나 '/api/users#123' 이렇게 주소를 변형한다. 서버는 #을 무시하기 때문에 둘다 같은 주소로 보내는 요청으로 인식함

  const onLogout = useCallback(() => {
    axios
      .post('/api/users/logout', null, {
        withCredentials: true,
      })
      .then(() => {
        // 서버에 요청 보내는 대신에 클라이언트에서 데이터를 조작할 수 있는 mutate라는 기능이 있음
        // useSWR말고 swr에도 mutate 존재. -> 이건 범용적으로 쓸 수 있음

        // mutate("http://localhost:3095/api/users/logout", false) 이렇게 사용 가능.

        mutate(false, false);
        // mutate의 두번째 인자는 shouldRevalidate인데 true이면, 서버요청 없이 데이터를 바꿨다가 나중에 서버한테 점검을 하게됨.
        // mutate는 서버에 요청을 보내기도 전에 데이터 부터 바꾸고, 그 후에 서버에 요청을 보냄. 그래서 서버한테 점검 해야함.

        // 내가 보낸 요청이 성공할 거라고 낙관적으로 보고, UI에 반영 후 점검 하는 것. => optimistic UI
        // 내가 보낸 요청이 실패할 거라고 낙관적으로 보고, 점검 한 후에 UI에 반영. => pessimistic UI
      });
  }, []);

  const onClickUserProfile = useCallback((e: any) => {
    e.stopPropagation();
    setShowUserMenu((prev) => !prev);
  }, []);

  const onClickCreateWorkSpace = useCallback(() => {
    setShowCreateWorkspaceModal(true);
  }, []);

  const onCreateWorkspace = useCallback(
    (e) => {
      // form을 submit 할 땐 항상 새로고침이 되지 않도록 preventDefault 추가
      e.preventDefault();

      // 공백 여부, 필수 값 체크
      if (!newWorkspace || !newWorkspace.trim()) return;
      if (!newUrl || !newUrl.trim()) return;

      axios
        .post(
          '/api/workspaces',
          {
            workspace: newWorkspace,
            url: newUrl,
          },
          {
            // 이게 있어야 내가 로그인 한 상태라는 것을 서버가 쿠키를 전달해서 알 수 있다.
            withCredentials: true,
          },
        )
        .then(() => {
          // 제출 하고 input 값을 비워주지 않으면, 다음 번에 클릭했을 때 이전 입력 값이 남아있 수 있으니 비우기
          mutate();
          setShowCreateWorkspaceModal(false);
          setNewWorkpsace('');
          setNewUrl('');
        })
        .catch((error) => {
          console.dir(error);
          toast.error(error.response?.data, { position: 'bottom-center' });
        });
    },
    [newWorkspace, newUrl],
  );

  // 화면에 떠 있는 모든 모달 닫음
  const onCloseModal = useCallback(() => {
    setShowCreateWorkspaceModal(false);
    setShowCreateChannelModal(false);
    setShowInviteWorkspaceModal(false);
    setShowInviteChannelModal(false);
  }, []);

  const toggleWorkspaceModal = () => {
    setShowWorkspaceModal((prev) => !prev);
  };

  const onClickAddChannel = useCallback(() => {
    setShowCreateChannelModal(true);
  }, []);

  const onClickInviteWorkspace = useCallback(() => {
    setShowInviteWorkspaceModal(true);
  }, []);

  if (!userData) {
    return <Redirect to="/login" />;
  }

  // npm 모듈 설치 시 @types 까지 설치해야되는게 뭔지 모른다면?
  // npmjs.com 사이트로 가서 gravatar 검색 -> 검색 결과 클릭 시 이름 옆에 "DT"이면 깔아야하고, "TS"이면 안깔아도됨.
  // "DT" 조차 없으면 내가 직접 타입을 만들어야함.
  // 간혹가다 npm 모듈 만든사람이랑 TS 만든사람이 다른 경우 타입이 안맞아서 에러가 날 수 있는데
  // 그 경우는 또 내가 직접 타입을 만들어야함.

  // 모든 컴포넌트를 styledComponent로 만들면 구조 파악에 방해됨
  // 큼직큼직한 구역 단위로만 만들고, css로 sass 스타일로 하는게 좋다

  return (
    <div>
      <Header>
        <RightMenu>
          <span>
            <span onClick={onClickUserProfile}>
              <ProfileImg src={gravatar.url(userData.email, { s: '28px', d: 'retro' })} alt={userData.nickname} />
              {/* 단일 책임 원칙: 하나의 컴포넌트는 하나의 역할만 한다. => 이 규칙에 따라 컴포넌트를 분리하기도함. */}
              {showUserMenu && (
                <Menu style={{ right: 0, top: 38 }} show={showUserMenu} onCloseModal={onClickUserProfile}>
                  <ProfileModal>
                    <img src={gravatar.url(userData.nickname, { s: '36px', d: 'retro' })} alt={userData.nickname} />
                    <div>
                      <span id="profile-name">{userData.nickname}</span>
                      <span id="profile-active">Active</span>
                    </div>
                  </ProfileModal>
                  <LogOutButton>로그아웃</LogOutButton>
                </Menu>
              )}
            </span>
          </span>
        </RightMenu>
      </Header>
      <button onClick={onLogout}>로그아웃</button>
      <WorkspaceWrapper>
        <Workspace>
          {userData?.Workspaces.map((ws) => {
            return (
              <Link key={ws.id} to={`/workspace/${123}/channel/일반`}>
                <WorkspaceButton>{ws.name.slice(0, 1).toUpperCase()}</WorkspaceButton>
              </Link>
            );
          })}
          <AddButton onClick={onClickCreateWorkSpace}>+</AddButton>
        </Workspace>
        <Channels>
          <WorkspaceName onClick={toggleWorkspaceModal}>{}</WorkspaceName>
          <MenuScroll>
            <Menu show={showWorkspaceModal} onCloseModal={toggleWorkspaceModal} style={{ top: 95, left: 80 }}>
              <WorkspaceModal>
                <h2>Sleact</h2>
                <button onClick={onClickInviteWorkspace}>워크스페이스에 사용자 초대</button>
                <button onClick={onClickAddChannel}>채널 만들기</button>
                <button onClick={onLogout}>로그아웃</button>
              </WorkspaceModal>
            </Menu>
            <ChannelList />
            <DMList />
          </MenuScroll>
        </Channels>
        <Chats>
          <Switch>
            <Route path="/workspace/:workspace/channel/:channel" component={Channel} />
            <Route path="/workspace/:workspace/dm/:id" component={DirectMessage} />
          </Switch>
        </Chats>
      </WorkspaceWrapper>
      <Modal show={showCreateWorkspaceModal} onCloseModal={onCloseModal}>
        <form onSubmit={onCreateWorkspace}>
          <Label id="workspace-label">
            <span>워크스페이스 이름</span>
            <Input id="workspace" value={newWorkspace} onChange={onChangeNewWorkspace} />
          </Label>
          <Label id="workspace-url-label">
            <span>워크스페이스 url</span>
            <Input id="workspace" value={newUrl} onChange={onChangeNewUrl} />
          </Label>
          <Button type="submit">생성하기</Button>
        </form>
      </Modal>
      <CreateChannelModal
        show={showCreateChannelModal}
        onCloseModal={onCloseModal}
        setShowCreateChannelModal={setShowCreateChannelModal}
      />
      <InviteWorkspaceModal
        show={showInviteWorkspaceModal}
        onCloseModal={onCloseModal}
        setShowInviteWorkspaceModal={setShowInviteWorkspaceModal}
      />
      <InviteChannelModal
        show={showInviteChannelModal}
        onCloseModal={onCloseModal}
        setShowInviteChannelModal={setShowInviteChannelModal}
      />
    </div>
  );
};

export default Workspace;
