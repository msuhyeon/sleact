// import useSocket from '@hooks/useSocket';
import { CollapseButton } from '@components/DMList/styles';
import useSocket from '@hooks/useSocket';
import { IUser, IUserWithOnline } from '@typings/db';
import fetcher from '@utils/fetcher';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { NavLink } from 'react-router-dom';
import useSWR from 'swr';

const DMList: FC = () => {
  // props로 userData를 받아오지않고 useSWR로 데이터를 받아온다.
  // 컴포넌트 하나에 추가로 useSWR을 넣는다고 해도 요청이 새로 보내진 것 아니고, 캐싱된걸 그대로 씀.
  // 새로 요청 보내는건 dedupingInterval 로 컨트롤 할 수 있고!
  // props를 되도록 안쓰는게 좋다 부모의 변화 때문에 자식까지 리렌더링 되는걸 방지 하기 위함
  // 사실 성능 면에선 비슷하지만 화면의 깜빡임이 줄어드니까 최적화할때 좀 더 편리 useSelector를 useSWR이 어느정도 대체
  const { workspace } = useParams<{ workspace?: string }>();
  const {
    data: userData,
    error,
    revalidate,
    mutate,
  } = useSWR<IUser>('/api/users', fetcher, {
    dedupingInterval: 2000, // 2초
  });
  const { data: memberData } = useSWR<IUserWithOnline[]>(
    userData ? `/api/workspaces/${workspace}/members` : null,
    fetcher,
  );
  // hooks로 하면 공통적으로 관리가 되고 있기 때문에 필요한 때에 불러서 쓰면 된다. workspace가 꺼져도 DM list에서 유지가능
  const [socket] = useSocket(workspace);
  const [channelCollapse, setChannelCollapse] = useState(false);
  const [onlineList, setOnlineList] = useState<number[]>([]);

  const toggleChannelCollapse = useCallback(() => {
    setChannelCollapse((prev) => !prev);
  }, []);

  useEffect(() => {
    console.log('DMList: workspace 바꼈다', workspace);
    setOnlineList([]);
  }, [workspace]);

  useEffect(() => {
    // 서버로 부터 누가 온라인인지 받아옴
    socket?.on('onlineList', (data: number[]) => {
      setOnlineList(data);
    });
    // socket?.on('dm', onMessage);
    // console.log('socket on dm', socket?.hasListeners('dm'), socket);

    // 정리 하는 곳!
    return () => {
      // socket?.off('dm', onMessage);
      // console.log('socket off dm', socket?.hasListeners('dm'));
      socket?.off('onlineList'); 
      // 이벤트 리스너가 있으면 이벤트 정리하는 함수도 있다!! 
      // 만약에 on만 5번 됐을 경우, 한번 서버에서 데이터를 보내줄 때 프론트에서는 5번을 받는다.
      // 이벤트 리스너가 두번 이상 연결 되지 않도록 꼭 정리를 하는 cleanUp함수가 필요함.
    };
  }, [socket]);

  return (
    <>
      <h2>
        <CollapseButton collapse={channelCollapse} onClick={toggleChannelCollapse}>
          <i
            className="c-icon p-channel_sidebar__section_heading_expand p-channel_sidebar__section_heading_expand--show_more_feature c-icon--caret-right c-icon--inherit c-icon--inline"
            data-qa="channel-section-collapse"
            aria-hidden="true"
          />
        </CollapseButton>
        <span>Direct Messages</span>
      </h2>
      <div>
        {!channelCollapse &&
          memberData?.map((member) => {
            const isOnline = onlineList.includes(member.id);
            return (
              // NavLink는 activeClassName을 줄 수 있는게 Link와의 차이점
              // 클릭 한 요소만 highlighted 할 때 사용
              <NavLink key={member.id} activeClassName="selected" to={`/workspace/${workspace}/dm/${member.id}`}>
                <i
                  className={`c-icon p-channel_sidebar__presence_icon p-channel_sidebar__presence_icon--dim_enabled c-presence ${
                    isOnline ? 'c-presence--active c-icon--presence-online' : 'c-icon--presence-offline'
                  }`}
                  aria-hidden="true"
                  data-qa="presence_indicator"
                  data-qa-presence-self="false"
                  data-qa-presence-active="false"
                  data-qa-presence-dnd="false"
                />
                <span>{member.nickname}</span>
                {member.id === userData?.id && <span> (나)</span>}
              </NavLink>
            );
          })}
      </div>
    </>
  );
};

export default DMList;
