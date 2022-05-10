import React from 'react';
import loadable from '@loadable/component';
import { Route, Switch, Redirect } from 'react-router-dom';

// 코드 스플릿팅(Code Splitting)
// Single page application 이면 나중에 웹사이트가 커지면 수백페이지가 될 텐데 모두 하나의 js파일로 만들면 용량이 커지는데, 그러면 페이지 로딩하는데 한세월이 걸려서 ux(사용자 경험)가 안좋아진다. 
// 3초안에 화면을 보여주지 않으면 유저들이 이탈한다는 말이 있음. 그래서 필요한 페이지들만 불러오는게 좋다. 
// Code splitting을 이용해서 필요없는 컴포넌트는 처음에 불러오지 않도록, 필요한 컴포넌트는 그때그때 불러오도록 한다.
// “어떤 컴포넌트를 분리해야할 것 인가?” 
// 1. 페이지 단위
// 2. SSR(Server Side Rendering)이 필요없는 애들 (화면에 에디터가 있어야한다고 가정하면, 에디터는 굳이 서버에서 불러 올 필요가 없다) 
// SSR안되게 코드 스플릿팅 해놓으면 서버 용량을 아낄 수 있다.

// 알아서 code splitting 하고 불러온다.
// code splitting을 언제할지, 언제 불러올 지 고민하지 않아도 된다.
const LogIn = loadable(() => import("@pages/LogIn"));
const SignUp = loadable(() => import("@pages/SignUp"));
const Channel = loadable(() => import("@pages/Channel"));

const App = () => {
  return ( 
      <Switch>
        <Redirect exact path="/" to="/login" />
        <Route path="/login" component={LogIn}/>
        <Route path="/signup" component={SignUp}/>
        <Route path="/workspace/channel" component={Channel}/>
      </Switch>
  ); 
    
};

export default App;
