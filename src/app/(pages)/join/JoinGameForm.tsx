'use client'
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import firebase from '../../utils/firebase';
import {
    doc,
    onSnapshot,
    setDoc,
    collection,
    query,
    where,
    serverTimestamp
  } from 'firebase/firestore';
  import {v4 as uuidv4} from 'uuid';
import { isNetworkAvailable } from "@/app/utils/extra";

export default function JoinGameForm() {

  // HOOKS
  const router = useRouter()

  // DATA
  const gamesColletionRef = collection(firebase, 'games');
  const playersColletionRef = collection(firebase, 'players');
  const [isValidGameCode, setisValidGameCode] = useState<boolean>(false)
  const [formErrorMessage, setformErrorMessage] = useState<string>("")
  const [gameIdFromLocalstorage, setgameIdFromLocalstorage] = useState<any>()
  const [gameIdInput, setgameIdInput] = useState<string>("")
  const [gamePlayerName, setgamePlayerName] = useState<string>("")
  const [disabledButton, setdisabledButton] = useState<boolean>(false)

  // Handle and validate form
  const handleSubmit = (event : any) =>{
    event.preventDefault();
    if (!isNetworkAvailable()) return //Return is network is not available

    // Validate game id
    if(!isValidGameCode){
      checkGameId(gameIdInput)
    }

    // Check if game is valid and player has a valid name
    if(isValidGameCode && gamePlayerName.replace(/\s/g, '').length){
      setdisabledButton(true)
      localStorage.removeItem('gameId');
      addPlayerToGame()
    }
  }

  // Add player to game
  async function addPlayerToGame() {
    const createPlayer = {
      game_id : gameIdInput,
      player_id : uuidv4(),
      player_name : gamePlayerName,
      createdAt : serverTimestamp(),
    };

    try {
      const playerRef = doc(playersColletionRef, createPlayer.player_id);
      setDoc(playerRef, createPlayer);

      // Player details to save in localStorage
      const playerDetails = {
        player_id: createPlayer.player_id,
        game_id: createPlayer.game_id
      }
      localStorage.setItem('playerDetails', JSON.stringify(playerDetails))
      router.push(`/room/${gameIdInput}`);
    } catch (error) {
      console.error(error);
      setformErrorMessage("An error occurred")
      setdisabledButton(false)
    }
  }

  // Check if the user is alreay in the game and then redirect them to game page
  const checkIfUserAlreadyInGame = () =>{
    if(!localStorage.getItem('playerDetails')) return false
    let playerDetails = JSON.parse(localStorage.getItem('playerDetails') || "");
    if(playerDetails.game_id ===gameIdInput){
      router.push(`/room/${gameIdInput}`);
    }
  }

  // Check if the game code is valid
  async function checkGameId(gameIdInput : string) {

    // Return false if gamecode is an empty string
    if (gameIdInput===""){return}

    // Query Statement
    const queryClause = query(
      gamesColletionRef,
      where('game_id', '==', gameIdInput),
    );

    let gameDetails : any = {}

      // Get game details from database
      onSnapshot(queryClause, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            gameDetails = doc.data()
        });

        // if game code exists , then set the valid state to true
        if(gameDetails.game_id){
          setisValidGameCode(true)
        } else{
          setformErrorMessage("Invalid game code")
        }
    });

  }

  useEffect(() => {
    localStorage.removeItem('gameAdmin')
    setgameIdFromLocalstorage(localStorage.getItem('gameId') )
    setgameIdInput(localStorage.getItem('gameId') || "")
    checkGameId(localStorage.getItem('gameId') || "")
    return () => {}
  }, [])

  // Check if user is already in game
  useEffect(() => {
    if(isValidGameCode){
      checkIfUserAlreadyInGame()
    }
    return () => {}
  }, [isValidGameCode])


  return (
    <form onSubmit={handleSubmit}>

    {/* Game code input */}
     <input
      type="number"
      value={gameIdInput}
      onChange={(e)=> setgameIdInput(e.target.value)}
      autoFocus={true}
      required
      readOnly={isValidGameCode ? true : false}
      placeholder="Enter game code"
      onClick={() => setformErrorMessage("")}
      className="form-control text-lg mt-1 w-full py-3 px-3 tracking-widest rounded border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-blue-500 focus:ring-1 focus:border-100 transition duration-0 hover:duration-150"
     />

    {/* Player name input  */}
    { isValidGameCode || gameIdFromLocalstorage ?
      <>
        <p className="mt-4 text-lg">Enter your name</p>
        <input
          type="text"
          onChange={(e)=> setgamePlayerName(e.target.value)}
          required
          placeholder="Enter your name"
          autoFocus={true}
          maxLength={15}
          onClick={() => setformErrorMessage("")}
          className="form-control text-lg mt-1 w-full py-3 px-3 tracking-widest rounded border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-blue-500 focus:ring-1 focus:border-100 transition duration-0 hover:duration-150"
        />
      </> : ''
    }
      <button
        type="submit"
        disabled={disabledButton}
        className='btn flex py-3 px-10 place-content-center mt-7 bg-blue-500 text-white rounded-lg w-full font-bold drop-shadow'>
        {isValidGameCode || gameIdFromLocalstorage ? "Join game" : "Next"}
      </button>

      {/* If there is an error message */}
      { formErrorMessage &&  <p className="mt-2 text-red-500">{formErrorMessage}</p>}
    </form>
  )
}
