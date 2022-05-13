# sleact
slack clone coding

리액트에선 input이 들어갈 때 컴포넌트를 나누는 것 이 좋다.
 => 입력을 할 때 마다 자꾸 state를 바꿔서 전체 리렌더링을 일으키기 때문.

주소 체계가 중요함
 => 상태관리를 따로 안해도 주소만 보고도 어떤 상태인지 알 수 있기 때문.
 => App.tsx 와 CreateChannelModal.tsx 를 참조