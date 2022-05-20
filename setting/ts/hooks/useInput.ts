import { useState, useCallback, Dispatch, SetStateAction } from 'react';

// 타입스크립트가 가독성이 안좋기 때문에 타입을 변수로 빼놓을 수 있다.
// (가독성은 안좋지만 안정성이 늘어남!)
type ReturnTypes<T = any> = [T, (e: any) => void, Dispatch<SetStateAction<T>>];

// ts가 인라인 콜백 함수는 매개변수를 추론해준다.
// 변수는 딱히 타입을 지정하지 않아도 알아서 ts가 추론한다.
// 이런 매개 변수의 경우 타입을 지정해야 lint error가 안나는데 1. 제너릭 2. any를 사용할 수 있다.
// 이 경우 제너릭에 any를 기본값으로 넣어준다.
// 매개변수와 리턴값의 타입을 정의해줬다. T가 string이 들어오면 리턴도 string 으로 정해진다.
// any로 타입을 지정했을 때 안좋은점은 입력을 string으로 받아도 리턴이 string으로 되지 않음.

// 아무런 타입이 들어와서 T가 되기는 하는데 적어도 T에다가 제한을 둔다 string이나 number로 들어오게
const useInput = <T extends string | number>(initialData: T): ReturnTypes<T> => {
  const [value, setValue] = useState(initialData);
  const handler = useCallback((e: any) => {
    setValue(e.target.value as unknown as T);
    // setValue는 타입이 string이 아니라 T여야 한다는 에러 메시지가 뜨기 때문에 타입을 강제로 바꿔줌 -> any 만큼 안좋지만.. any 보단 나음
  }, []);

  // () => void : 리턴 값이 없다. undefined 처럼 사용된다.
  // [T, (e: any) => void, Dispatch<SetStateAction<T>>] 는 리턴값의 타입을 선언한 것
  // e를 any 대신 ChangeEvent<HTMLInputElement>, e.target.value 대신 e.target.value as unknown as T로 바꿀 수 있다.
  return [value, handler, setValue];
};

export default useInput;
