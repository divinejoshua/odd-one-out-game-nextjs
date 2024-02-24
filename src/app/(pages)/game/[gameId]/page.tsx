"use client"

import Header from "@/app/components/Header"
import DisplayCard from "../DisplayCard"
import { useEffect, useState } from "react"
import {
  doc,
  onSnapshot,
  setDoc,
  collection,
  query,
  where,
  updateDoc,
} from 'firebase/firestore';
import firebase from "@/app/utils/firebase"
import GAME_STATE from "@/app/utils/gamestate"

export default function GamePage({ params } : any) {

  //HOOKS
  const gameId = params.gameId

  // DATA
  const gamesColletionRef = collection(firebase, 'games');
  const [showQuestionForm, setshowQuestionForm] = useState<boolean>(true)
  const [gameState, setgameState] = useState<string>("")
  const [gameRoundId, setgameRoundId] = useState<string>("")


  // Check for current game state
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

      // If there is a game state then redirect the users to the games page
      if(gameDetails.game_state){
        setgameState(gameDetails.game_state)
        setgameRoundId(gameDetails.game_round)
      }
    })

    return () => {
      getGameState
    }
  }, [gameState])

  return (
    <main className="">
      <Header/>
        <DisplayCard gameId={params.gameId} gameRoundId={gameRoundId}/>
    </main>
  )
}
