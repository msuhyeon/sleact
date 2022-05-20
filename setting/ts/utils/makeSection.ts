import { IDM, IChat } from '@typings/db';
import dayjs from 'dayjs';

export default function makeSection(chatList: (IDM | IChat)[]) {
  const sections: { [key: string]: (IDM | IChat)[] } = {};
  chatList.forEach((chat) => {
    const monthDate = dayjs(chat.createdAt).format('YYYY-MM-DD');
    if (Array.isArray(sections[monthDate])) {
      sections[monthDate].push(chat);
    } else {
      sections[monthDate] = [chat];
    }
  });
  return sections;
}

// [{id: 1, d:'2022-01-01'}, {id: 2, d:'2022-02-03'}, {id: 3, d:'2022-02-03'}]
// 데이터가 이런 케이스 일 경우

// sections = {
//   '2022-01-01': [1],
//   '2022-02-03': [2, 3]
// }
// 이런 형태
