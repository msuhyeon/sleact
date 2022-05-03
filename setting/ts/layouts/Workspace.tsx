import React, {useCallback} from "react"
import useSWR from "swr"
import fetcher from '@utils/fetcher';
import axios from "axios";

const Workspace = () => {
    const { data: userData, error, revalidate } = useSWR('/api/users', fetcher);
    const onLogout = useCallback(() => {
        axios.post("http://localhost:309/api/users/logout", null, {
            withCredentials: true,
        }).then(() => {
            revalidate();
        });
    }, [])

    <button onClick={onLogout}>로그아웃</button>
}

export default Workspace