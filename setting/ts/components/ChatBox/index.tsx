import { ChatArea, EachMention, Form, MentionsTextarea, SendButton, Toolbox } from '@components/ChatBox/styles';
import { IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import React, { useCallback, useEffect, useRef, VFC } from 'react';
import autosize from 'autosize';
import { Mention, SuggestionDataItem } from 'react-mentions';
import { useParams } from 'react-router';
import useSWR from 'swr';
import gravatar from 'gravatar';

interface Props {
  chat: string;
  onSubmitForm: (e: any) => void;
  onChangeChat: (e: any) => void;
  placeholder?: string;
}
const ChatBox: VFC<Props> = ({ chat, onSubmitForm, onChangeChat, placeholder }) => {
  // 이 컴포넌트는 재사용 되고 있기 때문에 구체적인 작업을 하면 안됨 -> 부모로 데이터 submit
  // 재사용 되는데 같은 데이터는 훅으로 가져오고, 다른 데이터는 props로 빼줌
  const { workspace } = useParams<{ workspace: string }>();
  const {
    data: userData,
    error,
    revalidate,
    mutate,
  } = useSWR<IUser | false>('/api/users', fetcher, {
    dedupingInterval: 2000, // 2초
  });
  const { data: memberData } = useSWR<IUser[]>(userData ? `/api/workspaces/${workspace}/members` : null, fetcher);

  // 태그에 직접 접근하고 싶을 때 사용
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    // ref가 존재 할 경우
    if (textareaRef.current) {
      autosize(textareaRef.current);
    }
  }, []);

  const onKeydownChat = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        // shift 눌렀는지 확인
        if (!e.shiftKey) {
          e.preventDefault();
          onSubmitForm(e);
        }
      } 
    },
    [onSubmitForm], // props로 받은것은 웬만하면 [deps]에 넣어줌
  );

  // <Mention />의 renderSuggestion 타입을 그대로 긁어옴
  const renderSuggestion = useCallback(
    (
      suggestion: SuggestionDataItem,
      search: string,
      highlightedDisplay: React.ReactNode,
      index: number,
      focus: boolean,
    ): React.ReactNode => {
      if (!memberData) return;
      return (
        // 버튼 태그
        <EachMention focus={focus}>
          <img
            src={gravatar.url(memberData[index].email, { s: '20px', d: 'retro' })}
            alt={memberData[index].nickname}
          />
          <span>{highlightedDisplay}</span>
        </EachMention>
      );
    },
    [memberData],
  );

  return (
    <ChatArea>
      <Form onSubmit={onSubmitForm}>
        {/* input태그에서 value와 onChange는 항상 같은 태그 안에
            MentionsTextarea는 MentionsInput에 css가 추가된 버전이라고 보면됨
        */}
        <MentionsTextarea
          id="editor-chat"
          value={chat}
          onChange={onChangeChat}
          onKeyPress={onKeydownChat}
          placeholder={placeholder}
          inputRef={textareaRef}
          allowSuggestionsAboveCursor
        >
          {/* trigger 옵션: 태깅 활성화
              appendSpaceOnAdd 옵션: 태깅 할 사람 선택 후 커서 한칸 띄우기?
              Mention의 부모는 무조건 MentionsInput 이어야함(규칙)
           */}
          <Mention
            appendSpaceOnAdd
            trigger="@"
            data={memberData?.map((v) => ({ id: v.id, display: v.nickname })) || []}
            renderSuggestion={renderSuggestion}
          />
        </MentionsTextarea>
        <Toolbox>
          <SendButton
            className={
              'c-button-unstyled c-icon_button c-icon_button--light c-icon_button--size_medium c-texty_input__button c-texty_input__button--send' +
              (chat?.trim() ? '' : ' c-texty_input__button--disabled')
            }
            data-qa="texty_send_button"
            aria-label="Send message"
            data-sk="tooltip_parent"
            type="submit"
            disabled={!chat?.trim()}
          >
            <i className="c-icon c-icon--paperplane-filled" aria-hidden="true" />
          </SendButton>
        </Toolbox>
      </Form>
    </ChatArea>
  );
};

export default ChatBox;
