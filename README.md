# sleact
slack clone coding

리액트에선 input이 들어갈 때 컴포넌트를 나누는 것 이 좋다.
    : 입력을 할 때 마다 자꾸 state를 바꿔서 전체 리렌더링을 일으키기 때문.

주소 체계가 중요함
    : 상태관리를 따로 안해도 주소만 보고도 어떤 상태인지 알 수 있기 때문.
    : App.tsx 와 CreateChannelModal.tsx 를 참조

 Websocket
    : 실시간으로 서버와 데이터를 주고 받을 때 사용하는 양방향 통신
    : 연결 한번에 프론트 <-> 서버 통신

Socket.io 는 사실 리액트랑 잘 어울리지 않는다.
    : 한번 연결 해놓으면 전역적인 특징을 띄기 때문에, 하나의 컴포넌트에 연결해놨다가 다른 컴포넌트로 가면 연결이 끊어져버림
    : 하나의 컴포넌트에 종속되게 넣으면 안됨. 공통된 컴포넌트에 넣어줌(HOC)
    : HOC는 Hooks로 대체 되었으니 Hook에 넣는다.
    : HTTP로 보냈다가 Web Socket으로 전환함. 
    : IE 구 버전의 경우 Websocket이 없는 브라우저가 있어서 우선 HTTP로 요청을 보내고(poling), WebSocket을 지원하는 서버나 브라우저 임이 확인되면 그때 WebSocket으로 변환함!!
    : 브라우저를 종료하면 자동으로 연결이 해제된다.

Day.JS
    : moment보다 더 많이 쓰고 있는 추세
    : moment와 API가 거의 똑같음.
    : 불변성을 지키고 가볍다.
    : 다국어, 브라우저 모듀 지원.

moment의 단점
    : 불변성을 지키지 않는다 = 참조 관계가 유지된다.
    : 불변성이 안지켜 지는 케이스? a객체와 a를 복사한 b 객체가 있다. b객체를 바꾸었더니 a도 따라 바뀌는것.

Luxon
    : moment 만든 제작자들이 moment의 단점을 인정하고 새로 만듬 Immutable

date-fns
    : lodash 스타일 
    : Day.js의 라이벌이라 취향 껏 골라쓰면 됨

a??b;
    : nullish coalescing

최적화를 하려면 말단 컴포넌트에서 memo, useMemo를 잘 사용해야함