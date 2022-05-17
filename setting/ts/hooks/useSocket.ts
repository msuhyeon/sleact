import io from 'socket.io-client';
import { useCallback } from 'react';

// 이런건 웬만하면 변수로 빼는게 좋음 배포할 때 수정할 경우에 번거롭지 않게
const backUrl = 'http://localhost:3095';

const sockets: { [key: string]: SocketIOClient.Socket } = {};

// socket.io에는 계층이 있다.
// namespace와 room
// workspace를 namespace, channel을 room

const useSocket = (workspace?: string): [SocketIOClient.Socket | undefined, () => void] => {
  console.log('rerender', workspace);
  const disconnect = useCallback(() => {
    if (workspace) {
      sockets[workspace].disconnect();
      delete sockets[workspace];
    }
  }, [workspace]);
  if (!workspace) {
    return [undefined, disconnect];
  }

  // 이미 연결 돼 있는데 또 연결 할 필요 없어서 추가 한 조건
  if (!sockets[workspace]) {
    // 한번 연결하면 disconnect 하기 전엔 끊어 질 일 없다
    sockets[workspace] = io.connect(`${backUrl}/ws-${workspace}`, {
      transports: ['websocket'], // poling 말고 WebSocket만 사용해라
    });
  }
  return [sockets[workspace], disconnect];
};

export default useSocket;
