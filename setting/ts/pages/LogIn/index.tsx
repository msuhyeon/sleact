import useInput from '@hooks/useInput';
import { Button, Error, Form, Header, Input, Label, LinkContainer } from '@pages/SignUp/styles';
import axios from 'axios';
import React, { useCallback, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { Link } from "react-router-dom"
import useSWR from "swr"
import fetcher from '@utils/fetcher';

const LogIn = () => {
  // swr로 전역적으로 상태관리. 컴포넌트가 마운트 될 때 부터 작동함.
  // swr은 일단 요청을 보내서 받아온 데이터를 저장한다. (통상적으로 요청은 GET요청, POST를 못 쓰는건 아닌데 보통 GET요청에 대한 데이터를 SWR이 저장해주고 있다.)
  // 내가 로그인 했으니까 내 정보 갖다 줘! 라는걸 서버에 날리면 된다 *(GET)
  // swr은 next 만든 곳에서 만들어서 next랑 잘어울린다
  // swr을 사용하면 다른탭에서 작업하고 있다가 몇시간 지나서 다시 서비스 탭으로 들어오면 자동으로 요청을 보낸다. 실시간으로 업데이트가 되서 항상 최신 데이터를 유지한다.

  // react query 라는 것도 있음. https://react-query.tanstack.com/overview
  // swr과 react query 중 맘에 드는거 쓰면됨

  // 계속 api를 호출하게 되면 비효율 적 이지 않나?
  // - 원할 때 swr을 호출하는게 있고
  // - swr이 몇번에 한번씩 주기적으로 호출 하는게 너무 빈번하다 싶을 때 이걸 막는 경우가 있다. (셀프 디도스 방지)
  // - revalidate 함수가있는데, revalidate 할 때 마다 호출이 되도록함. 원하는 때에 실행할 수 있다. (수동으로 데이터 갱신)
  // - dedupingInterval이란게 있다. 시간을 늘려주면 주기적으로 호출은 되지만 dedupingInterval 기간(100초) 내에는 캐시에서 불러온다
  // 공식 문서 참조 (https://swr.vercel.app/ko/docs/options)
  // 초단위로 돼있는건 제한 걸어주는게 많음.
  // 자주 쓰이는 것
  // dedupingInterval
  // focusThrottleInterval
  // errorRetryInterval: 가끔 서버가 정상인데도 에러나는 경우가 있는데(알 수 없는 에러), swr은 스스로 재요청 보내서 좋음
  // loadingTimeout
  // errorRetryCount
  
  // 다른 탭 갔다가 여기 왔을 때 새로 요청 보내는걸 할 때 할 수 있는 설정들.
  // revalidateOnFocus
  // refreshWhenHidden


  // fethcer라는 함수는 앞의 주소를 어떻게 처리할지를 적어주는 것, fetcher가 리턴하는 데이터가 data
  const { data: userData, error, mutate } = useSWR('/api/users', fetcher);
  const [logInError, setLogInError] = useState(false);
  const [email, onChangeEmail] = useInput('');
  const [password, onChangePassword] = useInput('');
  const onSubmit = useCallback(
    (e: { preventDefault: () => void; }) => {
      e.preventDefault();
      setLogInError(false);
      axios
        .post(
          '/api/users/login',
          { email, password },
          {
            // 쿠키 생성, 보내기를 위한 설정. 
            // 쿠키는 백엔드에서 생성해서 프론트엔드 브라우저가 기억하게끔 만들어주고, 프론트엔드는 한번 기억한 쿠키를 매 요청마다 백엔드로 보내줌.
            withCredentials: true,
          },
        )
        .then(() => {
          mutate();
        })
        .catch((error) => {
          setLogInError(error.response?.data?.code === 401);
        });
    },
    [email, password, mutate],
  );

  console.log(error, userData);
  if (!error && userData) {
    console.log('로그인됨', userData);
    return <Redirect to="/workspace/sleact/channel/일반" />;
  }

  return (
    <div id="container">
      <Header>Sleact</Header>
      <Form onSubmit={onSubmit}>
        <Label id="email-label">
          <span>이메일 주소</span>
          <div>
            <Input type="email" id="email" name="email" value={email} onChange={onChangeEmail} />
          </div>
        </Label>
        <Label id="password-label">
          <span>비밀번호</span>
          <div>
            <Input type="password" id="password" name="password" value={password} onChange={onChangePassword} />
          </div>
          {logInError && <Error>이메일과 비밀번호 조합이 일치하지 않습니다.</Error>}
        </Label>
        <Button type="submit">로그인</Button>
      </Form>
      <LinkContainer>
        아직 회원이 아니신가요?&nbsp;
        <Link to="/signup">회원가입 하러가기</Link>
      </LinkContainer>
    </div>
  );
};

export default LogIn;
