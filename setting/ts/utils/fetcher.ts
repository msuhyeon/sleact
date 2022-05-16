import axios from "axios"

const fetcher = (url: string) => axios.get(url, {
    // 백엔드랑 프론트엔드 서버가 도메인이 다르면 백->프론트로 쿠키 생성 불가능. 프론트->백으로 쿠키 보내주는게 불가능. 
    // 그래서 이 설정으로 쿠키 생성, 보내기 가능
    withCredentials: true,
}).then((response) => response.data)

 
// fetcher를 여러개를 만들어서 .then((response) => response.data.length 이러면 갯수를 리턴할 수 있다. 
// 서버에서 받는 그대로 프론트에 저장하는게 아니라... 데이터를 여기서 변조를 하면 SWR을 더 잘 활용할 수 있다. (data에 리턴 값이 저장되니까!)

export default fetcher  
