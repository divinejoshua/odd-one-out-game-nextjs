"use client"
import Header from "@/app/components/Header"
import PlayerList from "@/app/components/PlayerList"
import firebase from "@/app/utils/firebase";
import Link from "next/link"
import {
  doc,
  onSnapshot,
  setDoc,
  collection,
  query,
  where,
  updateDoc,
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GAME_STATE from "@/app/utils/gamestate";

export default function GamePage({ params } : any) {
  // HOOKS
  const router = useRouter()

  // DATA
  const gameId = params.gameId
  const playersColletionRef = collection(firebase, 'players');
  const gamesColletionRef = collection(firebase, 'games');
  const [playerList, setplayerList] = useState<[]>([])
  const [playerListOrder, setplayerListOrder] = useState<any>([])
  const [isPlayerAdmin, setisPlayerAdmin] = useState<boolean>(false)
  const [gameState, setgameState] = useState<string>("")


  // Re order playerList by time created
  const reorderPlayerListAccendingOrder = (playerList : any) =>{
    playerList.sort((a : any , b : any) => a.createdAt - b.createdAt);
    setplayerListOrder(playerList)
  }

  // check if is the admin
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const checkIfPlayerIsAdmin =() =>{
    if(!localStorage.getItem('playerDetails')) return false
    let playerDetails = JSON.parse(localStorage.getItem('playerDetails') || "");

    // Return if the player list is empty
    if(playerListOrder.length < 1) return false;

    setisPlayerAdmin(false)
    if(playerListOrder[0].player_id === playerDetails.player_id){
      setisPlayerAdmin(true)
    } else {
      setisPlayerAdmin(false)
    }
    return false
  };

  // This function will create a new game round and redirect the users to the game pages
  const startGame = () =>{
    if(!isPlayerAdmin) return false
    let playerDetails = JSON.parse(localStorage.getItem('playerDetails') || "");
    const updatedGame = {
      game_state : GAME_STATE.GAME_SEND_QUESTIONS,
      game_admin : playerDetails.player_id
    };

    try {
      const gameRef = doc(gamesColletionRef, gameId);
      updateDoc(gameRef, updatedGame);
    } catch (error) {
      // console.error(error);
    }
  }

  // Get player List
  useEffect(() => {
    // Query Statement
    const queryClause = query(
      playersColletionRef,
      where('game_id', '==', gameId),
    );

    // Get messages from database
    const getPlayerList = onSnapshot(queryClause, (querySnapshot) => {
      const response : [] | any = [];
      querySnapshot.forEach((doc) => {
        response.push(doc.data())
      });
      setplayerList(response)
    })

    return () => {
      getPlayerList
    }
  }, [])

  // Re order player list
  useEffect(() => {
    if(!gameState){
      // Call the function and log the reordered list
      reorderPlayerListAccendingOrder(playerList)
      checkIfPlayerIsAdmin() //Check if the player is admin
    }

    return () => {
    }
  }, [playerList, checkIfPlayerIsAdmin])


  // Check for current game round
  useEffect(() => {
    // Query Statement
    const queryClause = query(
      gamesColletionRef,
      where('game_id', '==', gameId),
    );

    // Get messages from database
    const getGameState = onSnapshot(queryClause, (querySnapshot) => {
      let gameDetails : any = {}
      querySnapshot.forEach((doc) => {
          gameDetails = doc.data()
      });

      // If there is a game round then redirect the users to the games page
      if(gameDetails.game_state){
        setgameState(GAME_STATE.GAME_SEND_QUESTIONS)
        // The URL format is /game/<gameID>/<gameRound>
        router.push(`/game/${gameId}`);
      }
    })

    return () => {
      getGameState
    }
  }, [gameState])

  return (
    <main className="">
      <Header/>
      <div className="mt-3 text-center text-lg">
        You game Id is
        <h2 className="mt-2 text-3xl font-bold tracking-widest">{gameId}</h2>
      </div>

      {/* Player list */}
      <PlayerList playerList={playerListOrder}/>

      {/* This button is only available to the game admin */}
      {/* The route is /game/<gameID>/<gameRoundId> */}
      {
        isPlayerAdmin &&
          <center>
            {/* <Link href={'/game/123434/tesfghbh'}> */}
              <button
                onClick={()=> startGame()}
                className='btn flex py-3 place-content-center mt-10 bg-blue-500 text-white px-12 rounded-full font-bold drop-shadow show-delay'>
                Start game
              </button>
            {/* </Link> */}
          </center>
      }
    </main>
  )
}
