"use client"

import { useEffect, useState } from "react";
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
import {v4 as uuidv4} from 'uuid';

export default function DisplayCard(props : any) {

  //Data
  let gameId = props.gameId
  let gameRoundId = props.gameRoundId
  const [activeQuestion, setactiveQuestion] = useState<number>(1)
  const [countDownSeconds, setcountDownSeconds] = useState<number>(3)
  const gamesColletionRef = collection(firebase, 'games');
  const [gameAdmin, setgameAdmin] = useState<boolean>(false)
  const questionsColletionRef = collection(firebase, 'questions');
  const [DisplayCardValue, setDisplayCardValue] = useState<any>({})
  const [questionListOrder, setquestionListOrder] = useState<any>([])
  const [gameplayerDetails, setgameplayerDetails] = useState<any>()
  const [mainKeyword, setmainKeyword] = useState<string>("")

  // The change question function
  const changeQuestion = (value: number) =>{

    const updatedGame = {
      active_question : value,
    };

    try {
      const gameRef = doc(gamesColletionRef, gameId);
      updateDoc(gameRef, updatedGame);
    } catch (error) {
      // console.error(error);
    }

    setactiveQuestion(value)
  }

  // Finish Question then takes user back to the Write question page by updating game state
  const finishQuestion = () =>{
    const updatedGame = {
      game_state : GAME_STATE.GAME_SEND_QUESTIONS,
      game_round : uuidv4(),
      active_question : 1,
    };

    try {
      const gameRef = doc(gamesColletionRef, gameId);
      updateDoc(gameRef, updatedGame);
    } catch (error) {
      // console.error(error);
    }
  }

  // Count down Timer effect
  useEffect(() => {
    let timer : any
    if (countDownSeconds>0){
      timer = countDownSeconds > 0 && setInterval(() => setcountDownSeconds(countDownSeconds - 1), 1000);
    }
    return () =>{ clearInterval(timer) };
  }, [countDownSeconds, props]);


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

      // Set the activeQuestion
      setcountDownSeconds(3)
      setactiveQuestion(gameDetails.active_question)

      // get admin user status
      if(!localStorage.getItem('playerDetails')) return
      let playerDetails = JSON.parse(localStorage.getItem('playerDetails') || "");
      setgameplayerDetails(playerDetails)
      if(gameDetails.game_admin ===playerDetails.player_id){
        setgameAdmin(true);
      }
    })

    return () => {
      getGameState
    }
  }, [activeQuestion])


  // Get Question List
  useEffect(() => {
    // Query Statement
    const queryClause = query(
      questionsColletionRef,
      where('game_round', '==', gameRoundId),
    );

    // Get messages from database
    const getQuestionList = onSnapshot(queryClause, (querySnapshot) => {
      let response : any = {}
      querySnapshot.forEach((doc) => {
        response = doc.data()
      });
      let messages = response.message
      let oddPlayers = response.oddPlayers

      if(oddPlayers){
        let playerDetails = JSON.parse(localStorage.getItem('playerDetails') || "");
        for (let i = 0; i < oddPlayers.length; i++) {
          if(playerDetails.player_id == oddPlayers[i].player_id){
            setmainKeyword(oddPlayers[i].oddItem)
          } else {
            setmainKeyword(messages[0])
          }

        }
        console.log(oddPlayers[0].oddItem)

      }


      setDisplayCardValue(response)
    })

    return () => {
      getQuestionList
    }
  }, [gameRoundId])


  return (
    <div className="pt-3 px-2">
      <div className="clear-both">
        <p className="text-lg">Game code &nbsp;  - &nbsp; <b>{props.gameId}</b></p>
      </div>
      {/* Loader  */}
      {
        countDownSeconds > 0 &&
        <div className="text-3xl mt-20 text-center text-gray-500">
          <p className="text-xl">Loading...</p>
          <h4 className="mt-2 text-5xl">{countDownSeconds}</h4>
        </div>
      }

      {/* Question box */}
      { countDownSeconds === 0 && DisplayCardValue &&
        <div className="mt-10">
            <div className='message-card rounded shadow-sm border mt-5 py-10 px-7'>
                <div className='message-body text-center text-xl text-gray-700'>
                  <p>{DisplayCardValue?.oddPlayers?.oddItem}</p>
                  <p>{mainKeyword}</p>
                </div>
            </div>

        </div>
      }

      {/* If there were no questions asked */}
     
        <div>
          <center>
            <p className="mt-6">Your card will be displayed here</p>
           
          </center>
        </div>


    </div>

  )
}
