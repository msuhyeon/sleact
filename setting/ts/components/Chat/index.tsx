import { ChatWrapper } from '@components/Chat/styles';
import { IDM, IChat } from '@typings/db';
import React, { VFC, memo, useMemo } from 'react';
import gravatar from 'gravatar';
import dayjs from 'dayjs';
import regexifyString from 'regexify-string';
import { Link, useParams } from 'react-router-dom';

interface Props {
  data: IDM | IChat;
}

// 타입 가드(Type Guard)
// 두가지 이상의 타입이 겹쳐져있을 때 타입을 구분 해 주는 것
// function a(b: number | string) {
//   if (typeof b === "number") {
//     b.toFixed() -> 타입이 넘버라고 타입 스크립트가 if문을 해석해서 추론하고 있기 때문에 에러가 안남
//   }
//   b.toFixed() 타입이 스트링인지 넘버인지 모르니까 에러남
// }

const BACK_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3095' : 'https://sleact.nodebird.com';
const Chat: VFC<Props> = ({ data }) => {
  const { workspace } = useParams<{ workspace: string; channel: string }>();
  // 디엠 보낸사람 sender
  // Sender는 DM에만 있는 특성이어서 조건을 이렇게
  // Type guard 사용됨
  const user = 'Sender' in data ? data.Sender : data.User;

  // DM 입력 할 때 불필요한 렌더링이 발생함
  // Hooks 안에서 개별 컴포넌트를 캐싱하고 싶다면 useMemo 사용!
  const result = useMemo(
    () =>
      // uploads\\서버주소
      data.content.startsWith('uploads\\') || data.content.startsWith('uploads/') ? (
        <img src={`${BACK_URL}/${data.content}`} style={{ maxHeight: 200 }} />
      ) : (
        regexifyString({
          input: data.content,
          // @[닉네임](1) 패턴! /@[]()로 틀을 잡는다
          // g는 모두 찾기
          // .은 모든 글자, +는 1개 이상(최대한 많이), \d 숫자, ?는 0개나 1개, *는 0개 이상, +? 최대한 조금 찾기, \n 줄바꿈
          // ()로 묶는건 그루핑으로, 묶인 값이 arr[1], arr[2]...에 추가된다
          pattern: /@\[(.+?)]\((\d+?)\)|\n/g,
          decorator(match, index) {
            const arr: string[] | null = match.match(/@\[(.+?)]\((\d+?)\)/)!; // 아이디만 찾아서 걸리는게 있으면
            if (arr) {
              return (
                <Link key={match + index} to={`/workspace/${workspace}/dm/${arr[2]}`}>
                  @{arr[1]}
                </Link>
              );
            }
            return <br key={index} />;
          },
        })
      ),
    [workspace, data.content], // 캐싱을 갱신 할 값
  );

  return (
    <ChatWrapper>
      <div className="chat-img">
        <img src={gravatar.url(user.email, { s: '36px', d: 'retro' })} alt={user.nickname} />
      </div>
      <div className="chat-text">
        <div className="chat-user">
          <b>{user.nickname}</b>
          <span>{dayjs(data.createdAt).format('h:mm A')}</span>
        </div>
        <p>{result}</p>
      </div>
    </ChatWrapper>
  );
};

export default memo(Chat); // 컴포넌트를 캐싱할 때 react memo를 사용. props가 똑같으면 부모가 바뀌어도, 자식이 리렌더링 되지 않게 해주는 것
