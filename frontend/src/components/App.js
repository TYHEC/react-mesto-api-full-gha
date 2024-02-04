import React from "react";
import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import api from "../utils/Api";
import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import Login from "./Login";
import InfoTooltip from "./InfoTooltip";
import ProtectedRoute from "./ProtectedRoute";
import Register from "./Register";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import ImagePopup from "./ImagePopup";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import ConfirmPopup from "./ConfirmPopup";
import * as auth from "../utils/Auth";
import SuccessImgSrc from "../images/Info_Success.svg";
import FailImgSrc from "../images/Info_Fail.svg";

function App() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isConfirmPopupOpen, setIsConfirmPopupOpen] = useState(false);
  const [isInfoPopupOpen, setIsInfoPopupOpen] = useState(false);
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [deletedCard, setDeletedCard] = useState(null);
  const [currentUser, setCurrentUser] = useState({});
  const [editSubmitTitle, setEditSubmitTitle] = useState("Сохранить");
  const [avatarSubmitTitle, setAvatarSubmitTitle] = useState("Обновить");
  const [addSubmitTitle, setAddSubmitTitle] = useState("Добавить");
  const [infoTitle, setInfoTitle] = useState("");
  const [infoImg, setInfoImg] = useState(null);
  useEffect(() => {
    checkToken();
  }, []);

  function checkToken() {
    const token = localStorage.getItem('token');
    if (token) {
      auth.getContent(token).then((res) => {
        if (res) {
          setLoggedIn(true);
          setUserEmail(res.email);
          navigate("/", { replace: true });
        }
      })
        .catch(() => {
          console.log(`Ошибка при проверке токена`);
        });
    }
  }


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      Promise.all([api.getUserData(), api.getInitialCards()])
        .then(([resUser, resCards]) => {
          setCurrentUser(resUser);
          setCards(resCards.reverse());
        })
        .catch(() => {
          console.log(`Ошибка при загрузке данных пользователя и карточек.`);
        });
    }
  }, [loggedIn]);

  function handleRegistration(email, password) {
    auth.registerUser(email, password)
      .then((res) => {
        if (res) {
          setInfoTitle("Вы успешно зарегестрировались!");
          setInfoImg(SuccessImgSrc);
          navigate('/sign-in', { replace: true });
        }
      })
      .catch(() => {
        setInfoTitle("Что-то пошло не так! Попробуйте ещё раз.");
        setInfoImg(FailImgSrc);
      })
      .finally(() => {
        setIsInfoPopupOpen(true);
      });
  }

  function handleLogin(email, password) {
    auth.loginUser(email, password)
      .then(() => {
        const token = localStorage.getItem('token');
        if (token) {
          setUserEmail(email);
          setLoggedIn(true);
          navigate('/', { replace: true });
        }
      })
      .catch(() => {
        setInfoTitle("Не получилось войти! Попробуйте ещё раз.");
        setInfoImg(FailImgSrc);
        setIsInfoPopupOpen(true);
        console.log(`Ошибка при входе в систему`);
      });
  }

  function handleLogout() {
    setLoggedIn(false);
    localStorage.removeItem('token');
    navigate('/sign-in', { replace: true });
  }


  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }

  function handleDeleteCardClick(card) {
    setIsConfirmPopupOpen(true);
    setDeletedCard(card);
  }

  function closeAllPopups() {
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsConfirmPopupOpen(false);
    setIsInfoPopupOpen(false);
    setSelectedCard(null);
  }

  function handleCardClick(card) {
    setSelectedCard(card);
  }

  function handleCardLike(card) {
    const isLiked = card.likes.some(i => i._id === currentUser._id);
    if (isLiked) {
      api.removeLike(card._id)
        .then((res) => {
          setCards((state) =>
            state.map((c) => c._id === card._id ? res : c)
          );
        })
        .catch(() => {
          console.log(`Ошибка при удалении лайка.`)
        });
    } else {
      api.setLike(card._id)
        .then((res) => {
          setCards((state) =>
            state.map((c) => c._id === card._id ? res : c)
          );
        })
        .catch(() => {
          console.log(`Ошибка при постановке лайка.`)
        });
    }
  }


  function handleCardDelete() {
    api.deleteCard(deletedCard._id)
      .then(() => {
        setCards((state) =>
          state.filter((c) => c !== deletedCard)
        );
        closeAllPopups();
        console.log(`Карточка удалена.`)
      })
      .catch(() => {
        console.log(`Ошибка при удалении карточки.`)
      });
  }

  function handleUpdateUser(userData) {
    setEditSubmitTitle("Сохраняем...");
    const name = userData.name;
    const about = userData.about;
    api.editProfile(name, about)
      .then((res) => {
        setCurrentUser(res);
        closeAllPopups();
      })
      .catch(() => {
        console.log(`Ошибка при обновлении данных.`)
      })
      .finally(() => {
        setEditSubmitTitle("Сохранить")
      });
  }

  function handleUpdateAvatar(avatarData) {
    setAvatarSubmitTitle("Обновляем...");
    api.changeAvatar(avatarData.avatar)
      .then((res) => {
        setCurrentUser(res);
        closeAllPopups();
      })
      .catch(() => {
        console.log(`Ошибка при обновлении аватара.`)
      })
      .finally(() => {
        setAvatarSubmitTitle("Обновить")
      })
  }


  function handleAddPlaceSubmit(cardData) {
    setAddSubmitTitle("Добавляем...");
    const place = cardData.place;
    const pictureSrc = cardData.pictureSrc;
    api.addNewCard(place, pictureSrc)
      .then((newCard) => {
        setCards([newCard, ...cards]);
        closeAllPopups();
        console.log(`Карточка добавлена.`)
      })
      .catch(() => {
        console.log(`Ошибка при добавлении карточки.`)
      })
      .finally(() => {
        setAddSubmitTitle("Добавить")
      })
  }


  function handleEscClose(e) {
    if (e.key === 'Escape') {
      closeAllPopups();
    }
  }


  function handleOverlay(e) {
    if (!e.target.closest('.popup__container')) {
      closeAllPopups();
    }
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <>
        <Header onSignOut={handleLogout} userEmail={userEmail} />
        <Routes>
          <Route path="/" element={<ProtectedRoute
            loggedIn={loggedIn}
            element={Main}
            onEditProfile={handleEditProfileClick}
            onAddPlace={handleAddPlaceClick}
            onEditAvatar={handleEditAvatarClick}
            onCardClick={handleCardClick}
            onCardLike={handleCardLike}
            onCardDelete={handleDeleteCardClick}
            cards={cards}
          />
          } />
          <Route path="/sign-in" element={<Login onLogin={handleLogin} />} />
          <Route path="/sign-up" element={<Register onRegister={handleRegistration} />} />
        </Routes>
        <Footer />
        <EditProfilePopup
          isOpen={isEditProfilePopupOpen}
          onClose={closeAllPopups}
          onUpdateUser={handleUpdateUser}
          submitTitle={editSubmitTitle}
          onEscClick={handleEscClose}
          onOverlayClick={handleOverlay}
        />
        <AddPlacePopup
          isOpen={isAddPlacePopupOpen}
          onClose={closeAllPopups}
          onAddPlace={handleAddPlaceSubmit}
          submitTitle={addSubmitTitle}
          onEscClick={handleEscClose}
          onOverlayClick={handleOverlay}
        />
        <EditAvatarPopup
          isOpen={isEditAvatarPopupOpen}
          onClose={closeAllPopups}
          onUpdateAvatar={handleUpdateAvatar}
          submitTitle={avatarSubmitTitle}
          onEscClick={handleEscClose}
          onOverlayClick={handleOverlay}
        />
        <ImagePopup
          type="picture-popup"
          card={selectedCard}
          onClose={closeAllPopups}
          onEscClick={handleEscClose}
          onOverlayClick={handleOverlay}
        />
        <ConfirmPopup
          isOpen={isConfirmPopupOpen}
          onClose={closeAllPopups}
          onConfirm={handleCardDelete}
          onEscClick={handleEscClose}
          onOverlayClick={handleOverlay}
        />
        <InfoTooltip
          isOpen={isInfoPopupOpen}
          onClose={closeAllPopups}
          infoTitle={infoTitle}
          infoImg={infoImg}
          onEscClick={handleEscClose}
          onOverlayClick={handleOverlay}
        />
      </>
    </CurrentUserContext.Provider>
  );
}

export default App;
