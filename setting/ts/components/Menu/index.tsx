import React, { CSSProperties, FC, useCallback } from "react"
import { CloseModalButton, CreateMenu } from "./styles"

// react의 PropTypes 정의 와 동일함
interface Props {
    show: boolean;
    onCloseModal: (e: any) => void;
    style: CSSProperties;
    closeButton: boolean;
}
const Menu: FC<Props> = ({children, style, show, onCloseModal, closeButton }) => {
    const stopPropagation = useCallback((e) => {
        // 이벤트 버블링 때문에 메뉴 자신을(div 태그) 클릭하면, 부모(CreateMenu 태그)까지 클릭 이벤트가 전달된다.
        
        // stopPropagation을 선언하면 부모 태그로 이벤트가 버블링이 안됨!!
        e.stopPropagation()
    }, [])
    return (
        <CreateMenu onClick={onCloseModal}>
            {/* 메뉴 바깥 영역을(부모) 클릭 했을 때 모달이 닫히고, 메뉴를(자신) 클릭했을 땐 유지하고 싶다면
            부모에다가 메뉴를 닫는 함수를 연결하고 메뉴 영역에는 stopPropagation */}
            <div onClick={stopPropagation} style={style}>
                {closeButton && <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>}
                {children}
            </div>
        </CreateMenu>
    )
}

Menu.defaultProps = {
    closeButton: true,
}

export default Menu