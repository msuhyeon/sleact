import React, {useState, useCallback} from "react";
import { Form, Error, Label, Input, LinkContainer, Button, Header } from "./styles"; // css in js
import axios from "axios"
// Styled Component는 최소한만 사용하는걸 추천함. 변수명을 많이 지어야하니까
// Styled Component의 불편함을 개선한 것이 emotion. 근데 사용량은 styled component가 더 많음
import { Link } from 'react-router-dom';
import useInput from "@hooks/useInput";

const SingUp = () => {
  const [email, onChangeEmail] = useInput("")
  const [nickname, onChangeNickname] = useInput("")
  const [password, setPassword] = useState("")
  // useInput을 사용하고 싶을 경우, 구조분해 할당에 의해 이런 식으로 표현이 가능하다.
  // const [password, , setPassword] = useInput("")
  // useInput을 써서 통일성있게 만들면서 커스터마이징을 해야된다 하면 필요한 변수 자리를 빈자리로 만들면 된다.
  const [passwordCheck, setPasswordCheck] = useState("")
  const [mismatchError, setMismatchError] = useState(false)

  // // useCallback을 사용하지 않으면 이 함수들이 매번 재생성된다. 
  // // 리렌더링이 많이 일어나니까 디버깅이 어려워지므로 useCallback 사용
  // // 리렌더링은 화면을 다시그리는건 아니다. 
  // const onChangeEmail = useCallback((e: { target: { value: React.SetStateAction<string>; }; }) => {
  //   setEmail(e.target.value)
  // }, [])

  // const onChangeNickname = useCallback((e: { target: { value: React.SetStateAction<string>; }; }) => {
  //   setNickName(e.target.value)
  // }, [])

  const onChangePassword = useCallback((e: { target: { value: React.SetStateAction<string>; }; }) => {
    setPassword(e.target.value)
    setMismatchError(e.target.value !== passwordCheck)
  }, [passwordCheck]) // dependency에 e.target.value를 쓰지 않는 이유는 이 함수 기준, 외부에 정의된 변수만 써준다.
  // setMismatchError, setPassword를 안써도 되는 이유? 한번 선언하면 그 값이 바뀌지 않는 다는 것이 보장되어있다. (공식문서에 있음)

  const onChangePasswordCheck = useCallback((e: { target: { value: React.SetStateAction<string>; }; }) => {
    setPasswordCheck(e.target.value)
    setMismatchError(e.target.value !== password)
  }, [password])

  const onSubmit = useCallback((e: { preventDefault: () => void; }) => {
    // form에서 e.preventDefault()를 하지 않으면 페이지가 새로고침 되어버림 새로고침되면 기존 spa의 상태들이 모두 소실되므로 항상 추가
    e.preventDefault()
    console.log(email, nickname, password, passwordCheck)
    console.log("역이", mismatchError)
    if (!mismatchError) {
      console.log("여기안와?!")
      console.log("서버로 회원가입")
      axios.post("http://localhost:3095/api/users", {
        email, nickname, password
      }).then((res) => {
        console.log(res)
      }).catch((err) => {
        console.error(err.response)
      }).finally(() => {

      })
    }
  }, [email, nickname, password, passwordCheck])

    return(
        <div id="container">
      <Header>Sleact</Header>
      <Form onSubmit={onSubmit}>
        <Label id="email-label">
          <span>이메일 주소</span>
          <div>
            <Input type="email" id="email" name="email" value={email} onChange={onChangeEmail} />
          </div>
        </Label>
        <Label id="nickname-label">
          <span>닉네임</span>
          <div>
            <Input type="text" id="nickname" name="nickname" value={nickname} onChange={onChangeNickname} />
          </div>
        </Label>
        <Label id="password-label">
          <span>비밀번호</span>
          <div>
            <Input type="password" id="password" name="password" value={password} onChange={onChangePassword} />
          </div>
        </Label>
        <Label id="password-check-label">
          <span>비밀번호 확인</span>
          <div>
            <Input
              type="password"
              id="password-check"
              name="password-check"
              value={passwordCheck}
              onChange={onChangePasswordCheck}
            />
          </div>
          {mismatchError && <Error>비밀번호가 일치하지 않습니다.</Error>}
          {!nickname && <Error>닉네임을 입력해주세요.</Error>}
          {/*{signUpError && <Error>{signUpError}</Error>}
          {signUpSuccess && <Success>회원가입되었습니다! 로그인해주세요.</Success>} */}
        </Label>
        <Button type="submit">회원가입</Button>
      </Form>
      <LinkContainer>
        이미 회원이신가요?&nbsp;
        <Link to="/login">로그인 하러가기</Link>
      </LinkContainer>
    </div>
    );
}

export default SingUp;