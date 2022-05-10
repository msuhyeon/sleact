import axios from "axios"

const fetcher = (url: string) => axios.get(url, {
    // 백엔드랑 프론트엔드 서버가 도메인이 다르면 백->프론트로 쿠키 생성 불가능. 프론트->백으로 쿠키 보내주는게 불가능.
    withCredentials: true,
}).then((response) => response.data)

export default fetcher