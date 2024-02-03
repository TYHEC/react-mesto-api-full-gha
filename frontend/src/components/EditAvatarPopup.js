import React from "react";
import PopupWithForm from "./PopupWithForm";
import { useRef } from 'react';

function EditAvatarPopup({ isOpen, onClose, onUpdateAvatar, submitTitle, onEscClick, onOverlayClick }) {
    const avatarRef = useRef();

    function handleSubmit(e) {
        e.preventDefault();

        onUpdateAvatar({
            avatar: avatarRef.current.value,
        });
        avatarRef.current.value = "";
    }

    return (
        <PopupWithForm
            type="new-avatar-popup"
            name="newAvatarPopup"
            title="Обновить аватар"
            submitTitle={submitTitle}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={handleSubmit}
            onEscClick={onEscClick}
            onOverlayClick={onOverlayClick}
        >
            <input ref={avatarRef} className="popup__input popup__input_type_avatar" type="url" name="avatarSrc" defaultValue="" placeholder="Ссылка на аватар" id="avatar-input" required />
            <span id="avatar-input-error" className="popup__error"></span>
        </PopupWithForm>
    );
}

export default EditAvatarPopup;