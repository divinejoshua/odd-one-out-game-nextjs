import Header from "@/app/components/Header";
import JoinGameForm from "@/app/(pages)/join/JoinGameForm";

export default function JoinGamePage() {
  return (
    <main className="px-4">
        <Header/>
        <p className="mt-3 text-lg mb-3">Join a new game</p>
        <JoinGameForm/>
    </main>
  )
}
