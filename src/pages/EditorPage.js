import React, { useEffect, useRef, useState } from 'react'
import Client from '../components/Client'
import Editor from '../components/Editor'
import { initSocket } from '../socket'
import ACTIONS from '../Actions'
import { useLocation,useNavigate, Navigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Output from '../components/Output'

function EditorPage() {

  const socketRef = useRef(null)
  const codeRef = useRef(null)
  const [code, setCode] = useState('')
  const location = useLocation()
  const {roomId} = useParams()
  const reactNavigator = useNavigate()
  const [clients,setClients] = useState([])

  useEffect(() => {
    const init = async () =>{
      socketRef.current = await initSocket() 
      socketRef.current.on('connect_error',(err) => handleErrors(err))
      socketRef.current.on('connect_failed',(err) => handleErrors(err))
      
      function handleErrors(e){
        console.log('socket error',e)
        toast.error('Socket connection failed, try again later')
        reactNavigator('/')

      }
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username:location.state?.username,
      })

      socketRef.current.on(ACTIONS.JOINED,({clients, username, socketId})=>{
        if(username !== location.state?.username){
          toast.success(`${username} joined the room`)
        }
        setClients(clients)
        socketRef.current.emit(ACTIONS.SYNC_CODE, {
          code:codeRef.current,
          socketId,
        }
        )
      })

      socketRef.current.on(ACTIONS.DISCONNECTED,({socketId, username}) =>{
        toast.success(`${username} left the room`)
        setClients((prev)=>{
          return prev.filter(client => client.socketId !== socketId)
        })
      })
    }


    init()
    return () =>{
      socketRef.current.disconnect()
      socketRef.current.off(ACTIONS.JOINED)
      socketRef.current.off(ACTIONS.DISCONNECTED)
    }
  }, [])
  
  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId)
      toast.success('Room ID is copied')
    } catch (error) {
      toast.error('Something went wrong')
    }
  } 
   
  function leaveRoom(){
    reactNavigator('/')
  }
  if(!location.state){
    return <Navigate to='/'/>
  }

  return (
    <div className='mainWrap'>
      <div className='aside'>
        <div className='asideInner'>
          <div className='logo'>
            <img className='logoImage' src='/codist-logo.png' alt='codist logo' width={200} height={70}></img>
          </div>
          <h3>Connected</h3>

          <div className='clientsList'>
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username}/>
            ))}
          </div>

        </div>
        <button className='btn copyBtn' onClick={copyRoomId}>Copy Room Id</button>
        <button className='btn leaveBtn' onClick={leaveRoom}>Leave</button>
      </div>

      <div className='editorWrap'>
        <Editor
         socketRef= {socketRef} 
         roomId={roomId} 
         onCodeChange={(newCode)=>{
          codeRef.current = newCode
          setCode(newCode)
          }}/>
        <Output code={code}/>
      </div>
      
      
    </div>
  )
}

export default EditorPage