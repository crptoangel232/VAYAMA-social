import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SendIcon, PaperclipIcon, VoiceIcon, VideoIcon, CheckDoubleIcon, PhoneIcon, VideoCameraIcon, StopIcon, XMarkIcon, MicrophoneIcon } from './common/icons';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const mockConversations = [
  { id: 1, name: 'Trip to Bo', lastMessage: 'See you there!', time: '10:42 AM', unread: 2, online: true, avatar: 'https://picsum.photos/seed/1/200' },
  { id: 2, name: 'Family Group', lastMessage: 'Alex: Are we meeting for dinner?', time: 'Yesterday', unread: 0, online: false, avatar: 'https://picsum.photos/seed/2/200' },
  { id: 3, name: 'Hotel Concierge', lastMessage: 'Your booking is confirmed.', time: 'Mar 15', unread: 0, online: true, avatar: 'https://picsum.photos/seed/3/200' },
  { id: 4, name: 'Jane Doe', lastMessage: 'Great, thanks!', time: 'Mar 14', unread: 0, online: false, avatar: 'https://picsum.photos/seed/4/200' }
];

interface ChatMessage {
    id: string;
    sender: 'me' | 'other';
    type: 'text' | 'image' | 'video' | 'audio';
    content: string; // text or url
    time: string;
    read?: boolean;
    fileName?: string;
}

const initialMessages: ChatMessage[] = [
    { id: '1', sender: 'other', type: 'text', content: 'Hey, are you ready for the trip tomorrow?', time: '10:40 AM', read: true },
    { id: '2', sender: 'me', type: 'text', content: 'Almost! Just packing my last few things. So excited!', time: '10:41 AM', read: true },
    { id: '3', sender: 'other', type: 'text', content: 'Awesome! I have the tickets. I\'ll pick you up at 8 AM.', time: '10:41 AM', read: true },
    { id: '4', sender: 'me', type: 'text', content: 'Perfect. See you there!', time: '10:42 AM', read: true },
];

const Chat: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeCall, setActiveCall] = useState<{type: 'audio'|'video', status: 'calling'|'connected'} | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // Media Recorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Supabase Realtime Subscription
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // Unique channel per conversation (simulated using ID)
    const channelId = `chat_room_${selectedConversation.id}`;
    const channel = supabase.channel(channelId);

    channel
      .on('broadcast', { event: 'message' }, (payload) => {
        if (payload.payload.sender !== 'me') {
            setMessages(prev => [...prev, payload.payload]);
        }
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
         if (payload.payload.sender !== 'me') {
             setIsTyping(payload.payload.isTyping);
         }
      })
      .on('broadcast', { event: 'call_start' }, (payload) => {
         // Simulate receiving a call
         if (!activeCall) {
            const accept = window.confirm(`Incoming ${payload.payload.type} call from ${selectedConversation.name}. Accept?`);
            if (accept) {
                setActiveCall({ type: payload.payload.type, status: 'connected' });
            }
         }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation, activeCall]);

  const broadcastMessage = async (msg: ChatMessage) => {
      if (isSupabaseConfigured()) {
          const channelId = `chat_room_${selectedConversation.id}`;
          await supabase.channel(channelId).send({
              type: 'broadcast',
              event: 'message',
              payload: msg
          });
      }
  };

  const broadcastTyping = async (typing: boolean) => {
      if (isSupabaseConfigured()) {
          const channelId = `chat_room_${selectedConversation.id}`;
          await supabase.channel(channelId).send({
              type: 'broadcast',
              event: 'typing',
              payload: { sender: 'me', isTyping: typing }
          });
      }
  };

  const sendMessage = async (content: string, type: 'text' | 'image' | 'video' | 'audio' = 'text', fileName?: string) => {
      const newMessage: ChatMessage = { 
          id: Date.now().toString(),
          sender: 'me', 
          type,
          content, 
          fileName,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false
      };
      
      setMessages(prev => [...prev, newMessage]);
      await broadcastMessage(newMessage);

      // Simulate reply if text
      if (type === 'text') {
        broadcastTyping(true); // Should actually trigger on other client, but simulating here
      }
  };

  const handleSendText = () => {
      if (input.trim() === '') return;
      sendMessage(input, 'text');
      setInput('');
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
          alert("File too large (max 10MB)");
          return;
      }

      let publicUrl = URL.createObjectURL(file); // Fallback

      if (isSupabaseConfigured()) {
          try {
              const fileExt = file.name.split('.').pop();
              const fileName = `${Date.now()}.${fileExt}`;
              const { data, error } = await supabase.storage
                  .from('media')
                  .upload(`chat/${fileName}`, file);
              
              if (!error) {
                  const { data: urlData } = supabase.storage.from('media').getPublicUrl(`chat/${fileName}`);
                  publicUrl = urlData.publicUrl;
              }
          } catch (err) {
              console.error("Upload failed, using local blob", err);
          }
      }
      
      sendMessage(publicUrl, type, file.name);
      e.target.value = '';
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Audio recording is not supported in this browser environment.");
        return;
    }
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorderRef.current.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            let publicUrl = URL.createObjectURL(audioBlob);

            if (isSupabaseConfigured()) {
                try {
                    const fileName = `${Date.now()}.webm`;
                    const { error } = await supabase.storage.from('media').upload(`chat/${fileName}`, audioBlob);
                    if (!error) {
                        const { data } = supabase.storage.from('media').getPublicUrl(`chat/${fileName}`);
                        publicUrl = data.publicUrl;
                    }
                } catch(e) { console.error("Audio upload failed", e) }
            }
            sendMessage(publicUrl, 'audio');
            // stop tracks
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
    } catch (err: any) {
        console.error("Microphone access error:", err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            alert("Microphone permission was denied. Please allow microphone access in your browser settings.");
        } else {
            alert("Could not access microphone: " + (err.message || "Unknown error"));
        }
    }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
      }
  };

  const initiateCall = (type: 'audio' | 'video') => {
      setActiveCall({ type, status: 'calling' });
      // Simulate connection delay
      if (isSupabaseConfigured()) {
          const channelId = `chat_room_${selectedConversation.id}`;
          supabase.channel(channelId).send({
              type: 'broadcast',
              event: 'call_start',
              payload: { type }
          });
      }
      setTimeout(() => {
          setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);
      }, 2000);
  };

  // Video stream for call
  useEffect(() => {
      let stream: MediaStream | null = null;
      
      const startStream = async () => {
          if (activeCall?.status === 'connected' && activeCall.type === 'video') {
              if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                  alert("Video calls are not supported in this browser environment.");
                  endCall();
                  return;
              }

              try {
                  stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                  if (localVideoRef.current) {
                      localVideoRef.current.srcObject = stream;
                  }
              } catch (err: any) {
                  console.error("Camera access denied", err);
                  if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                      alert("Camera/Microphone permission was denied. Please allow access in your browser settings.");
                  } else {
                      alert("Could not start video call: " + (err.message || "Unknown error"));
                  }
                  endCall();
              }
          }
      };

      startStream();
      
      return () => {
          if (stream) {
              stream.getTracks().forEach(track => track.stop());
          }
      }
  }, [activeCall]);

  const endCall = () => {
      setActiveCall(null);
  };

  return (
    <div className="flex h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 relative">
      
      {/* Call Overlay */}
      {activeCall && (
          <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center text-white">
              {activeCall.status === 'calling' ? (
                  <div className="flex flex-col items-center animate-pulse">
                      <img src={selectedConversation.avatar} className="w-24 h-24 rounded-full mb-4 border-4 border-blue-500" alt="Calling" />
                      <h2 className="text-2xl font-bold">Calling {selectedConversation.name}...</h2>
                  </div>
              ) : (
                  <div className="relative w-full h-full flex flex-col">
                      <div className="flex-grow relative bg-black flex items-center justify-center">
                          {activeCall.type === 'video' ? (
                            <>
                                <p className="absolute z-10 top-4 left-4 text-xs bg-black/50 p-1 rounded">Remote Stream (Simulated)</p>
                                <img src="https://picsum.photos/seed/call/800/600" className="max-w-full max-h-full object-contain opacity-50" alt="Remote" />
                                <div className="absolute bottom-4 right-4 w-32 h-48 bg-black border-2 border-white rounded-lg overflow-hidden shadow-xl">
                                    <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                                </div>
                            </>
                          ) : (
                             <div className="flex flex-col items-center">
                                 <div className="w-32 h-32 rounded-full bg-slate-700 flex items-center justify-center animate-pulse border-4 border-green-500">
                                     <MicrophoneIcon />
                                 </div>
                                 <h2 className="text-xl mt-4">{selectedConversation.name}</h2>
                                 <p className="text-slate-400">00:42</p>
                             </div>
                          )}
                      </div>
                      <div className="h-20 bg-slate-800 flex items-center justify-center space-x-8">
                          <button className="p-4 rounded-full bg-slate-600 hover:bg-slate-500"><MicrophoneIcon /></button>
                          <button onClick={endCall} className="p-4 rounded-full bg-red-600 hover:bg-red-500 shadow-lg transform hover:scale-110 transition-all"><XMarkIcon /></button>
                      </div>
                  </div>
              )}
              {activeCall.status === 'calling' && (
                  <button onClick={endCall} className="mt-8 p-3 bg-red-600 rounded-full hover:bg-red-500"><XMarkIcon /></button>
              )}
          </div>
      )}

      {/* Sidebar for conversations */}
      <div className={`w-full md:w-1/3 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col ${selectedConversation && 'hidden md:flex'}`}>
        <header className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Chats</h1>
        </header>
        <div className="flex-grow overflow-y-auto">
          {mockConversations.map(convo => (
            <div key={convo.id} onClick={() => { setSelectedConversation(convo); setMessages(initialMessages); }} className={`flex items-center p-3 cursor-pointer transition-colors border-b border-slate-200 dark:border-slate-800 ${selectedConversation?.id === convo.id ? 'bg-slate-200 dark:bg-slate-700' : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'}`}>
              <div className="relative">
                <img src={convo.avatar} alt={convo.name} className="w-12 h-12 rounded-full object-cover" />
                {convo.online && <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-slate-900"></span>}
              </div>
              <div className="flex-grow ml-3">
                <p className="font-semibold text-sm">{convo.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{convo.lastMessage}</p>
              </div>
              <div className="flex flex-col items-end text-xs text-slate-500 dark:text-slate-400">
                <p>{convo.time}</p>
                {convo.unread > 0 && <span className="mt-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">{convo.unread}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Main chat window */}
      <div className={`w-full md:w-2/3 flex flex-col ${!selectedConversation && 'hidden md:flex'}`}>
        {selectedConversation ? (
          <>
            <header className="flex items-center p-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
                <button onClick={() => setSelectedConversation(null as any)} className="md:hidden mr-2 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
              <img src={selectedConversation.avatar} alt={selectedConversation.name} className="w-10 h-10 rounded-full object-cover" />
              <div className="ml-3 flex-grow">
                <p className="font-semibold text-sm">{selectedConversation.name}</p>
                <p className={`text-xs ${selectedConversation.online ? 'text-green-500' : 'text-slate-500'}`}>{selectedConversation.online ? 'Online' : 'Offline'}</p>
              </div>
               <div className="flex items-center space-x-1">
                <button onClick={() => initiateCall('video')} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
                    <VideoCameraIcon />
                </button>
                 <button onClick={() => initiateCall('audio')} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
                    <PhoneIcon />
                </button>
              </div>
            </header>
            <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-slate-200/50 dark:bg-slate-800/50" style={{backgroundImage: 'url(https://i.redd.it/qwd83nc4xxf41.png)', backgroundSize: 'contain'}}>
               {messages.map((msg, index) => (
                   <div key={msg.id || index} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} animate-[fadeIn_0.3s_ease-out]`}>
                       <div className={`relative max-w-xs md:max-w-md py-2 px-3 rounded-lg shadow-sm text-sm ${msg.sender === 'me' ? 'bg-green-100 dark:bg-green-800/80 rounded-tr-none' : 'bg-white dark:bg-slate-700 rounded-tl-none'}`}>
                           {msg.type === 'text' && <p className="pr-12">{msg.content}</p>}
                           
                           {msg.type === 'image' && (
                               <div className="mb-2">
                                   <img src={msg.content} alt="sent" className="rounded-lg max-h-60 object-cover" />
                               </div>
                           )}

                           {msg.type === 'video' && (
                               <div className="mb-2">
                                   <video src={msg.content} controls className="rounded-lg max-h-60 w-full" />
                               </div>
                           )}

                           {msg.type === 'audio' && (
                               <div className="flex items-center gap-2 mb-1 min-w-[200px]">
                                   <audio src={msg.content} controls className="w-full h-8" />
                               </div>
                           )}

                           <div className="absolute bottom-1 right-2 flex items-center">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 mr-1">{msg.time}</span>
                            {msg.sender === 'me' && <CheckDoubleIcon className={msg.read ? "text-blue-500 h-3 w-3" : "text-slate-400 dark:text-slate-500 h-3 w-3"} />}
                           </div>
                       </div>
                   </div>
               ))}
               {isTyping && (
                  <div className="flex justify-start animate-bounce">
                    <div className="bg-white dark:bg-slate-700 p-3 rounded-lg shadow-sm rounded-tl-none">
                      <div className="flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse"></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                      </div>
                    </div>
                  </div>
                )}
               <div ref={messagesEndRef} />
            </div>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 flex items-center border-t border-slate-200 dark:border-slate-700">
                {isRecording ? (
                    <div className="flex-grow flex items-center justify-between px-4 py-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                        <span className="text-red-500 animate-pulse font-semibold text-sm">Recording...</span>
                        <button onClick={stopRecording} className="p-1 rounded-full bg-red-500 text-white hover:bg-red-600"><StopIcon /></button>
                    </div>
                ) : (
                    <>
                        <div className="flex">
                            <input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e, 'image')} accept="image/*" className="hidden" />
                            <input type="file" ref={videoInputRef} onChange={(e) => handleFileUpload(e, 'video')} accept="video/*" className="hidden" />
                            
                            <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 hover:text-blue-500 transition-transform hover:scale-110"><PaperclipIcon /></button>
                            <button onClick={startRecording} className="p-2 text-slate-500 hover:text-red-500 transition-transform hover:scale-110"><VoiceIcon /></button>
                            <button onClick={() => videoInputRef.current?.click()} className="p-2 text-slate-500 hover:text-blue-500 transition-transform hover:scale-110"><VideoIcon /></button>
                        </div>

                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                broadcastTyping(e.target.value.length > 0);
                            }}
                            onBlur={() => broadcastTyping(false)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
                            placeholder="Type a message..." 
                            className="flex-grow bg-white dark:bg-slate-700 rounded-full py-2 px-4 mx-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-shadow" 
                        />
                        <button onClick={handleSendText} className="bg-blue-500 p-2.5 rounded-full text-white hover:bg-blue-600 transform active:scale-95 transition-all">
                            <SendIcon />
                        </button>
                    </>
                )}
            </div>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center text-slate-500 bg-slate-100 dark:bg-slate-900">
            <p>Select a conversation to start chatting.</p>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Chat;