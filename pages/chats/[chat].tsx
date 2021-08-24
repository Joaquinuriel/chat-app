import { useRouter } from "next/router";
import Link from "next/link";
import {
  ArrowLeftIcon,
  DotsHorizontalIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/solid";
import { PaperClipIcon } from "@heroicons/react/outline";
import Menu from "src/menu";
// import PopUp from "src/popup";
import { createRef, useEffect, useState } from "react";
import firebase from "firebase/app";
import "firebase/firestore";
import { useAuth } from "src/auth";
import {
  useCollectionData,
  useDocumentDataOnce,
} from "react-firebase-hooks/firestore";

export default function Chat() {
  const router = useRouter();
  const { chat } = router.query;
  const auth = useAuth();
  const store = firebase.firestore();
  const col = store.collection("users");
  const doc = col.doc(chat as string);
  const [chatingUserData] = useDocumentDataOnce(doc);
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState("");

  useEffect(() => void !auth.user && router.push("/"));

  if (!auth.user) return <main></main>;

  const ChatBox = () => {
    const { user } = auth;
    const atSign = user.email.indexOf("@");
    const email = user.email.slice(0, atSign);
    // const collection = store.collection("users");
    // const doc = collection.doc(email);
    // const col = doc.collection(chat as string);
    // const [messages, loading, error] = useCollectionData(col);
    const collection = store.collection("chats");
    const doc = collection.doc((email + chat) as string);
    const col = doc.collection("chat");
    const [messages, loading, error] = useCollectionData(col);

    if (error) {
      return (
        <main>
          <h1>Error</h1>
          <Link href="/">Home</Link>
        </main>
      );
    }

    if (messages) {
      return (
        <main>
          {messages.map((msg, key) => {
            const sent = msg.uid === auth.user.uid;
            const classname = `message ${sent ? "sent" : "received"}`;
            return (
              <div key={key} className={classname}>
                <p>{msg.text}</p>
                {msg.uid !== auth.user.uid && <i>{msg.username}</i>}
              </div>
            );
          })}
        </main>
      );
    } else return <main></main>;
  };

  // const [popUpVisible, setPopUpVisible] = useState(false);

  const inputRef = createRef<HTMLInputElement>();
  const atSign = auth.user.email.indexOf("@");
  const email = auth.user.email.slice(0, atSign);

  const handleSend = () => {
    inputRef.current &&
      inputRef.current.value &&
      store
        .collection("chats")
        .doc((email + chat) as string)
        .collection("chat")
        .add({
          text: content,
          username: auth.user.displayName,
          uid: auth.user.uid,
          date: new Date(),
        })
        .then(() => (inputRef.current.value = null))
        .catch(console.log);
  };

  // const handleImport = () => {};

  // const userphoto = useDocumentDataOnce()
  const menuBtnRef = createRef<HTMLButtonElement>();
  // const popUpBtnRef = createRef<HTMLButtonElement>();

  return (
    <>
      <header>
        <Link href="/" passHref>
          <a>
            <ArrowLeftIcon />
          </a>
        </Link>
        <h1>{chat}</h1>
        <button ref={menuBtnRef} onClick={() => setVisible(true)}>
          <DotsHorizontalIcon />
        </button>
      </header>
      <Menu
        name={chatingUserData?.name}
        email={chatingUserData?.email}
        photo={chatingUserData?.photo}
        btn={menuBtnRef}
        visible={visible}
        onClickOut={() => setVisible(false)}
      />
      <ChatBox />
      <footer>
        <input
          ref={inputRef}
          type="text"
          placeholder="mensaje..."
          onChange={(e) => setContent(e.target.value)}
        />
        <button onClick={() => handleSend()}>
          <PaperAirplaneIcon />
        </button>
      </footer>
    </>
  );
}
