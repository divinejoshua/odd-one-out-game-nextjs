"use client"

import { useEffect, useState } from "react"
import {
  doc,
  onSnapshot,
  setDoc,
  collection,
  query,
  where,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import firebase from "@/app/utils/firebase"
import GAME_STATE from "@/app/utils/gamestate"
import {v4 as uuidv4} from 'uuid';
import { isNetworkAvailable, isValidMessageText } from "@/app/utils/extra";
import { useRouter } from "next/navigation";


export default function AdminForm(props : any) {

    // HOOKS
    const router = useRouter()

  //Data
  let gameId = props.gameId
  let gameRoundId = props.gameRoundId
  const playersColletionRef = collection(firebase, 'players');
  const [messageSentSuccess, setmessageSentSuccess] = useState<boolean>(false)
  const [isError, setisError] = useState<boolean>(false)
  const gamesColletionRef = collection(firebase, 'games');
  const questionsColletionRef = collection(firebase, 'questions');
  const [disabledButton, setdisabledButton] = useState<boolean>(false)
  const [values, setValues] = useState(['']);
  const [gameState, setgameState] = useState<string>("")
  const [isPlayerAdmin, setisPlayerAdmin] = useState<boolean>(false)
  const [playerList, setplayerList] = useState<any>([])
  // const [oddPlayers, setoddPlayers] = useState(['']);



   // The send messge function
   const SendMessage = async () =>{
    if (!isNetworkAvailable()) return //Return is network is not available
    // if(!isValidMessageText(messageBody)) return //Return if the message is invalid
    // setdisabledButton(true)
    if(!localStorage.getItem('playerDetails')) return false


    //New game round
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



    // Choose random players
   let oddPlayers = chooseRandomPlayers()

    let createQuestion = {
        game_round : gameRoundId,
        message : values,
        message_id : uuidv4(),
        oddPlayers : oddPlayers,
        game_id : gameId,
        createdAt : serverTimestamp(),
    };

    try {
        const questionRef = doc(questionsColletionRef, createQuestion.message_id);
        await setDoc(questionRef, createQuestion);
        setmessageSentSuccess(true)
    } catch (error) {
        console.log(error);
        setdisabledButton(false)
    }
    
   }

  //  Choose random players
   const chooseRandomPlayers = () =>{
    let randomPlayerIndices = getRandomIndices(playerList.length, values.length-1)

   
    let oddPlayers : any = []

    for (let i = 0; i < randomPlayerIndices.length; i++) {
      let oddPlayerId :any = {};
      oddPlayerId.player_id = playerList[randomPlayerIndices[i]].player_id
      oddPlayerId.oddItem = values[i+1]
      oddPlayers.push(oddPlayerId)
    }

    return oddPlayers
   }


   function getRandomIndices(length : any, numIndices : any) {
    let indices = [];
    while(indices.length < numIndices) {
        let index = Math.floor(Math.random() * length);
        if(indices.indexOf(index) === -1) indices.push(index);
    }
    return indices;
  }

  //  Update the game status value
   const updateGameStateValue = ()=>{
    const updatedGame = {
      game_state : GAME_STATE.GAME_LIST_QUESTIONS,
    };

    try {
      const gameRef = doc(gamesColletionRef, gameId);
      updateDoc(gameRef, updatedGame);
    } catch (error) {
      // console.error(error);
    }
   }


   const handleChange = (i : any, event : any) => {
    const newValues = [...values];
    newValues[i] = event.target.value;
    setValues(newValues);
};

  const handleAdd = () => {
      const newValues = [...values];
      newValues.push('');
      setValues(newValues);
  };


  const handleRemove = (i : any) => {
    const newValues = [...values];
    newValues.splice(i, 1);
    setValues(newValues);
};



const newGameRound = () =>{
  setmessageSentSuccess(false)
  setValues([''])
  
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

  return (
    <div className="pt-3 px-2">
      <div className="mb-16">
        <h3 className="float-left text-lg mt-1">Write your question here</h3>
      </div>
      {/* Question text area  */}
      { !messageSentSuccess ?
          // Text box before the message is sent
          <div>
            <div className='message-body mt-5 text-gray-700'>

            <div>
                {values.map((value, idx) => (
                  <>
                      <input
                          key={idx}
                          type="text"
                          value={value}
                          className='w-full border rounded p-3 mt-3
                            border-gray-300
                            focus:outline-none
                            focus:border-blue-500
                            focus:ring-blue-500 focus:ring-1 focus:border-100 transition duration-0 hover:duration-150'
                          onChange={e => handleChange(idx, e)}
                      />
                      <button onClick={() => handleRemove(idx)} className="mt-2 border border-gray-300 px-3 rounded">Remove</button>
                  </>
                ))}
            </div>

            </div>

            <center>
            <button
                 className='btn flex place-content-center mt-10 bg-white-500 border-gray-300 border text-black px-20 py-3 rounded-full font-bold'
                 onClick={handleAdd}>Add input
            </button>


              <button
                disabled={disabledButton}
                className='btn flex place-content-center mt-10 bg-blue-500 text-white px-20 py-3 rounded-full font-bold drop-shadow'
                onClick={()=> SendMessage() }
              >
                Start game
              </button>
            </center>
          </div>

        :
        // Success message
        <div className="text-center mt-20">
          <p className="text-2xl">Message sent successfully</p>

            <center> 
              <button
                className='btn flex place-content-center mt-10 bg-blue-500 text-white px-20 py-3 rounded-full font-bold drop-shadow'
                onClick={()=> newGameRound() }
              >
                New game round
              </button>
              </center>


              <ul>
                {values.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
        </ul>
        </div>
      }

    </div>
  )

}
