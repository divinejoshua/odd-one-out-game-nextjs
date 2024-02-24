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
  const [questionList, setquestionList] = useState([])
  const [questionListOrder, setquestionListOrder] = useState<any>([])

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

  // Re order questionList by time created
  const reorderQuestionListAccendingOrder = (questionList : any) =>{
    questionList.sort((a : any , b : any) => a.createdAt - b.createdAt);
    setquestionListOrder(questionList)
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
      const response : [] | any = [];
      querySnapshot.forEach((doc) => {
        response.push(doc.data())
      });
      setquestionList(response)
    })

    return () => {
      getQuestionList
    }
  }, [])

  // Re order question list
  useEffect(() => {
    // Call the function and log the reordered list
    reorderQuestionListAccendingOrder(questionList)
    return () => {
    }
  }, [questionList])


  return (
    <div className="pt-3 px-2">
      <div className="clear-both">
        <p className="text-lg float-left">Questions</p>
        <p className="text-lg float-right">Game code &nbsp;  - &nbsp; <b>{props.gameId}</b></p>
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
      { countDownSeconds === 0 && questionList.length > 0 &&
        <div className="mt-10">
            <div className='message-card rounded shadow-sm border mt-5 py-10 px-7'>
                <div className='message-body text-center text-xl text-gray-700'>
                    <p>{questionListOrder[activeQuestion-1]?.message}</p>
                </div>
            </div>

            {/* Pagination  */}
            <div className="mt-10 flex justify-between">
              { gameAdmin ?
                <button className='btn py-2 place-content-center bg-purple-500 text-white px-4 rounded-lg font-bold drop-shadow'
                  onClick={() => changeQuestion(activeQuestion-1)}
                  disabled={activeQuestion === 1}
                  >
                  Prev
                </button> : <p></p>
              }
              <p className="text-center text-lg mt-2"> {activeQuestion}/{questionList.length}</p>

              { gameAdmin ?
                <button className='btn py-2 place-content-center bg-blue-500 text-white px-4 rounded-lg font-bold drop-shadow'
                  onClick={() => changeQuestion(activeQuestion+1)}
                  disabled={activeQuestion == questionList.length}
                >
                  Next
                </button> : <p></p>
              }
            </div>

            {/* Finish and send the user back to the question form  */}
            { activeQuestion === questionList.length && gameAdmin &&
              <center>
                <button className='btn flex py-3 place-content-center mt-10 bg-blue-500 text-white px-12 rounded-full font-bold drop-shadow'
                 onClick={() => finishQuestion()}
                >
                  Play again
                </button>
              </center>
            }

        </div>
      }

      {/* If there were no questions asked */}
     
        <div>
          <center>
            <p className="mt-20 text-2xl">No Questions asked !</p>
            {
              countDownSeconds === 0 && questionList.length ===0 && gameAdmin &&
                <button className='btn flex py-3 place-content-center mt-10 bg-blue-500 text-white px-12 rounded-full font-bold drop-shadow'
                  onClick={() => finishQuestion()}
                >
                  Play again
                </button>
            }
          </center>
        </div>


    </div>

  )
}
