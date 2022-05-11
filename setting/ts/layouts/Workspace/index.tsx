import React, {FC, useCallback} from "react"
import useSWR from "swr"
import fetcher from '@utils/fetcher';
import axios from "axios";
import { Redirect, Switch, Route } from "react-router";
import { Channels, Chats, Header, MenuScroll, ProfileImg, RightMenu, WorkspaceName, WorkspaceWrapper } from '@layouts/Workspace/styles';
import gravatar from "gravatar"
import loadable from "@loadable/component";

const Channel = loadable(() => import("@pages/Channel"));
const DirectMessage = loadable(() => import("@pages/DirectMessage"));


// children을 쓰는 컴포넌트는 FC타입,  안쓰는 컴포넌트는 VFC가 타입
// FC라는 타입안에 children이 알아서 들어있다,
const Workspace: FC<React.PropsWithChildren<{}>> = ({children}) => {
    const { data, error, mutate } = useSWR('/api/users', fetcher);

    // SWR을 이용해서 로컬스토리지의 데이터를 가져 올 수도 있음. 항상 비동기 요청이랑만 관련있는게 아님. 전역 데이터 관리자! -> 리덕스를 대체!!
    // const { data } = useSWR('hello', () => {localStorage.setItem('data', key); return localStorage.getItem('data) })

    // 같은 주소 인데 두 가지 fetcher를 쓰고싶다?
    // 주소에 쿼리 스트링이나 '/api/users#123' 이렇게 주소를 변형한다. 서버는 #을 무시하기 때문에 둘다 같은 주소로 보내는 요청으로 인식함 

    const onLogout = useCallback(() => {
        axios.post("http://localhost:3095/api/users/logout", null, {
            withCredentials: true,
        }).then(() => {
            // 서버에 요청 보내는 대신에 클라이언트에서 데이터를 조작할 수 있는 mutate라는 기능이 있음
            // useSWR말고 swr에도 mutate 존재. -> 이건 범용적으로 쓸 수 있음

            // mutate("http://localhost:3095/api/users/logout", false) 이렇게 사용 가능.
            
            mutate(false, false);
            // mutate의  두번째 인자는 shouldRevalidate인데 true이면, 서버요청 없이 데이터를 바꿨다가 나중에 서버한테 점검을 하게됨.
            // mutate는 서버에 요청을 보내기도 전에 데이터 부터 바꾸고, 그 후에 서버에 요청을 보냄. 그래서 서버한테 점검 해야함.

            // 내가 보낸 요청이 성공할 거라고 낙관적으로 보고, UI에 반영 후 점검 하는 것. => optimistic UI
            // 내가 보낸 요청이 실패할 거라고 낙관적으로 보고, 점검 한 후에 UI에 반영. => pessimistic UI
        });
    }, [])

    if (!data) {
        return <Redirect to="/login" />
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
                        <ProfileImg src={gravatar.url(data.nickname, {s: "28px", d: "retro"})} alt={data.nickname}/>
                    </span>
                </RightMenu>
            </Header>
            <button onClick={onLogout}>로그아웃</button>
            <WorkspaceWrapper>
                <Workspace>test</Workspace> 
                <Channels>
                    <WorkspaceName>Sleact</WorkspaceName>
                    <MenuScroll>
                        MenuScroll
                    </MenuScroll>
                </Channels>
                <Chats>
                    <Switch>
                        <Route path="/workspace/channel" component={Channel}/>
                        <Route path="/workspace/dm" component={DirectMessage}/>
                    </Switch>
                </Chats>
            </WorkspaceWrapper>
            {children}
        </div>
    )
}

export default Workspace