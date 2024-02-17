import Header from "./components/Header";
import emojiImage from "./assets/emoji.png"
import eighteenImage from "./assets/eighteenplus.png"
import Image from "next/image";
import Link from "next/link";
import CreateNewGame from "./components/CreateNewGame";

export default function HomePage() {
  return (
    <main className="text-center">
      <Header/>
      <p className='mt-12 text-2xl flex justify-center'>
        <Image
          src={emojiImage}
          alt="OddOneOut"
          className="emoji-image"
        />
        &nbsp;Welcome to Odd One Out game&nbsp;
        <Image
          src={eighteenImage}
          alt="OddOneOut"
          width={20}
          className="eighteen-image mt-1"
        />
      </p>

      {/* Action buttons  */}
      <center>
        <section className="max-w-max mt-20">

          <Link href={'/join'}>
            <button className='btn flex py-4 place-content-center mt-7 bg-blue-500 text-white w-full px-14 rounded-full font-bold drop-shadow'>
              Join game
            </button>
          </Link>

          {/* Start new game button  */}
          <CreateNewGame/>

        </section>
      </center>
    </main>
   );
}
