import React, { useState } from 'react'
import {v4 as uuidv4} from 'uuid'
import {toast} from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

function Home() {
    const Navigate = useNavigate()
    
    const [roomId, setRoomId] = useState('')
    const [username, setUsername] = useState('')

    const createNewRoom= (e) =>{
        e.preventDefault()
        const id = uuidv4()
        setRoomId(id)
        toast.success('Created a new room')
    }

    const joinRoom=()=>{
       if(!roomId || !username){
        toast.error('Room Id & Username is required')
        return
       }

       //Redirect
       Navigate(`/editor/${roomId}`,{
        state:{
            username,
        },
       })

       toast.success(`You're successfully joined`)
    }
    
    const handleInputEnter = (e) =>{
        if(e.code === 'Enter'){
            joinRoom()
        }
    }
  return (
    <div className='homePageWrapper'>
        <div className='formWrapper'>
            <img className='homePageLogo' src='/codist-logo.png' alt='codist-logo' width={200} height={70}/>
            <h4 className='mainLabel'>Paste invitation Room id</h4>
            <div className='inputGroup'>
                <input
                    type='text'
                    className='inputBox'
                    placeholder='ROOM ID'
                    onChange={(e)=> setRoomId(e.target.value)}
                    value={roomId}
                    onKeyUp={handleInputEnter}
                />
                <input
                    type='text'
                    className='inputBox'
                    placeholder='USERNAME'
                    onChange={(e)=> setUsername(e.target.value)}
                    value={username}
                    onKeyUp={handleInputEnter}
                />
                <button className='btn joinBtn' onClick={joinRoom}>Join</button>
                <span className='createInfo'>Create new room id &nbsp;

                    <a onClick={createNewRoom} href='' className='createRoomId'>New room</a>
                </span>
            </div>
        </div>
        <footer>Built with ❤️ by Parvindar</footer>
    </div>
  )
}

export default Home