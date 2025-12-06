import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Post, Comment, Tab } from '../types';
import { mockPosts, mockStories } from '../data/mockData';
import { LikeIcon, CommentIcon, ShareIcon, PhotoIcon, CameraIcon, LocationMarkerIcon, ReplyIcon, SendIcon, MusicIcon, ReelsIcon } from './common/icons';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

type User = Post['user'];
type Story = typeof mockStories[0];
type Music = { title: string, artist: string };

// --- Sub-components for Social Feed --- //

const StoryViewer: React.FC<{ story: Story; onClose: () => void; }> = ({ story, onClose }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        const interval = setInterval(() => {
            setProgress(p => p + 100 / (5000 / 50));
        }, 50);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col p-3" onClick={onClose}>
            <div className="relative w-full h-1 bg-gray-500/50 rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-white rounded-full" style={{ width: `${progress}%`, transition: 'width 50ms linear' }}></div>
            </div>
            <div className="flex items-center my-3">
                <img src={story.avatar} alt={story.name} className="w-10 h-10 rounded-full object-cover"/>
                <p className="ml-3 font-semibold text-white">{story.name}</p>
            </div>
            <div className="flex-grow flex items-center justify-center">
                <img src={story.contentUrl} alt="Story content" className="max-h-full max-w-full rounded-lg" />
            </div>
        </div>
    );
};

const MusicSelectionModal: React.FC<{ onSelect: (music: Music) => void; onClose: () => void; }> = ({ onSelect, onClose }) => {
    const mockMusic: Music[] = [
        { title: 'Freetown Breeze', artist: 'Salone Beats' },
        { title: 'Highlife Fusion', artist: 'Krio Jazz Collective' },
        { title: 'Palm Wine Grooves', artist: 'Acoustic Africa' },
        { title: 'Sunset Riddim', artist: 'Beachside Reggae' },
    ];
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-center p-4">Add Music</h3>
                <div className="space-y-2 p-2">
                    {mockMusic.map(music => (
                        <button key={music.title} onClick={() => { onSelect(music); onClose(); }} className="w-full text-left p-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md">
                            <p className="font-semibold">{music.title}</p>
                            <p className="text-xs text-slate-500">{music.artist}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ImageEditorModal: React.FC<{
    imageUrl: string;
    onClose: () => void;
    onApplyFilter: (style: React.CSSProperties) => void;
}> = ({ imageUrl, onClose, onApplyFilter }) => {
    const filters = [
        { name: 'None', style: {} },
        { name: 'Grayscale', style: { filter: 'grayscale(100%)' } },
        { name: 'Sepia', style: { filter: 'sepia(100%)' } },
        { name: 'Invert', style: { filter: 'invert(100%)' } },
        { name: 'Contrast', style: { filter: 'contrast(200%)' } },
    ];

    return (
        <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-center p-4">Edit Photo</h3>
                <img src={imageUrl} alt="Editing" className="w-full h-auto max-h-64 object-contain" />
                <div className="p-2 flex overflow-x-auto space-x-2">
                    {filters.map(filter => (
                        <button key={filter.name} onClick={() => { onApplyFilter(filter.style); onClose(); }} className="flex-shrink-0 bg-slate-200 dark:bg-slate-700 rounded-md p-2 text-xs font-semibold">
                            {filter.name}
                        </button>
                    ))}
                </div>
                 <div className="p-2">
                    <button onClick={onClose} className="w-full mt-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 font-bold py-2 px-4 rounded-md transition-colors text-sm">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const UserProfile: React.FC<{ user: User; posts: Post[]; onBack: () => void; }> = ({ user, posts, onBack }) => (
    <div className="bg-slate-50 dark:bg-black w-full max-w-2xl mx-auto min-h-full">
        <header className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm p-3 border-b border-slate-200 dark:border-slate-800 flex items-center z-10">
            <button onClick={onBack} className="mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h1 className="text-xl font-bold">{user.name}</h1>
        </header>
        <div className="p-4">
            <div className="flex items-center space-x-4">
                <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover" />
                <div className="flex justify-around flex-grow text-center">
                    <div><p className="font-bold">{posts.filter(p => p.user.name === user.name).length}</p><p className="text-sm text-slate-500">Posts</p></div>
                    <div><p className="font-bold">1.2k</p><p className="text-sm text-slate-500">Followers</p></div>
                    <div><p className="font-bold">340</p><p className="text-sm text-slate-500">Following</p></div>
                </div>
            </div>
            <p className="font-semibold mt-4">{user.name}</p>
            <p className="text-sm text-slate-500">Travel enthusiast exploring the world, one Vayama trip at a time! 📍 Sierra Leone</p>
        </div>
        <div className="grid grid-cols-3 gap-0.5">
            {posts.filter(p => p.user.name === user.name && p.content.imageUrl).map(post => (
                <img key={post.id} src={post.content.imageUrl} alt="User post" className="w-full h-24 md:h-32 object-cover" />
            ))}
        </div>
    </div>
);

const CommentComponent: React.FC<{
    comment: Comment;
    onReply: (commentId: string, user: string) => void;
    onLike: (commentId: string) => void;
    level?: number;
}> = ({ comment, onReply, onLike, level = 0 }) => (
    <div className={`space-y-1 ${level > 0 ? 'ml-4 border-l-2 border-slate-200 dark:border-slate-700 pl-2' : ''}`}>
        <div className="flex items-start justify-between">
            <p className="text-sm break-words">
                <span className="font-semibold">{comment.user}</span>
                <span className="ml-1">{comment.text}</span>
            </p>
            <button onClick={() => onLike(comment.id)} className="flex-shrink-0 ml-2 p-1">
                <LikeIcon className="h-4 w-4 text-slate-500 hover:text-red-500" />
            </button>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>{comment.likes} {comment.likes === 1 ? 'like' : 'likes'}</span>
            <button onClick={() => onReply(comment.id, comment.user)} className="font-semibold hover:underline">Reply</button>
        </div>
        {comment.replies?.map(reply => (
            <CommentComponent key={reply.id} comment={reply} onReply={onReply} onLike={onLike} level={level + 1} />
        ))}
    </div>
);

const PostComponent: React.FC<{ 
    post: Post; 
    onSelectProfile: (user: User) => void; 
    onShareToReels: (post: Post) => void; 
}> = ({ post, onSelectProfile, onShareToReels }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes);
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [comments, setComments] = useState<Comment[]>(post.commentsData || []);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState<{id: string, user: string} | null>(null);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const commentInputRef = useRef<HTMLInputElement>(null);
    const shareMenuRef = useRef<HTMLDivElement>(null);

    // Close share menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
                setShowShareMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    
    const handleLikePost = () => {
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      // In real implementation: supabase.from('likes').insert(...)
    }

    const findCommentAndDo = (
        commentsList: Comment[],
        targetId: string,
        action: (comment: Comment) => Comment
    ): [Comment[], boolean] => {
        let found = false;
        const updated = commentsList.map(c => {
            if (c.id === targetId) {
                found = true;
                return action(c);
            }
            if (c.replies) {
                const [updatedReplies, childFound] = findCommentAndDo(c.replies, targetId, action);
                if (childFound) {
                    found = true;
                    return { ...c, replies: updatedReplies };
                }
            }
            return c;
        });
        return [updated, found];
    };

    const handleLikeComment = (commentId: string) => {
        const [updatedComments] = findCommentAndDo(comments, commentId, c => ({ ...c, likes: c.likes + 1 }));
        setComments(updatedComments);
    };
    
    const handleReply = (commentId: string, user: string) => {
        setReplyTo({id: commentId, user});
        setCommentsVisible(true);
        commentInputRef.current?.focus();
    }

    const handlePostComment = () => {
        if (!newComment.trim()) return;
        const comment: Comment = { id: Date.now().toString(), user: 'alex_doe', text: newComment.trim(), likes: 0, replies: [] };
        if (replyTo) {
            const [updatedComments] = findCommentAndDo(comments, replyTo.id, c => ({...c, replies: [...(c.replies || []), comment]}));
            setComments(updatedComments);
        } else {
            setComments([...comments, comment]);
        }
        setNewComment('');
        setReplyTo(null);
    };

    return (
        <div className="bg-white dark:bg-slate-900 mb-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mx-2 mt-2">
            <div className="p-3 flex items-center justify-between">
                <div className="flex items-center cursor-pointer" onClick={() => onSelectProfile(post.user)}>
                    <div className="p-0.5 bg-gradient-to-tr from-yellow-400 to-red-500 rounded-full">
                        <img src={post.user.avatar} alt={post.user.name} className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-black" />
                    </div>
                    <div className="ml-3">
                        <p className="font-bold text-sm hover:underline">{post.user.name}</p>
                        {post.location && <p className="text-xs text-slate-500">{post.location}</p>}
                    </div>
                </div>
                 <p className="text-xs text-slate-400">{post.timestamp}</p>
            </div>

            {post.content.imageUrl && (
                <div className="relative">
                    <img src={post.content.imageUrl} alt="Post content" className="w-full h-auto object-cover max-h-[500px]" />
                </div>
            )}
            
            <div className="p-3">
                <div className="flex items-center justify-between relative">
                    <div className="flex items-center space-x-4">
                        <button onClick={handleLikePost} className="hover:scale-110 transition-transform">
                            <LikeIcon isLiked={isLiked} className={`h-7 w-7 ${isLiked ? 'text-red-500' : 'text-slate-800 dark:text-white'}`} />
                        </button>
                        <button onClick={() => setCommentsVisible(!commentsVisible)} className="hover:scale-110 transition-transform">
                            <CommentIcon />
                        </button>
                        <div className="relative" ref={shareMenuRef}>
                            <button onClick={() => setShowShareMenu(!showShareMenu)} className="hover:scale-110 transition-transform">
                                <ShareIcon />
                            </button>
                            {showShareMenu && (
                                <div className="absolute left-0 bottom-full mb-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-20 py-1 animate-[fadeIn_0.1s_ease-out]">
                                    <button 
                                        onClick={() => {
                                            onShareToReels(post);
                                            setShowShareMenu(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                                    >
                                        <ReelsIcon /> Share to Reels
                                    </button>
                                    <button 
                                        onClick={() => {
                                            alert("Link copied!");
                                            setShowShareMenu(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                                    >
                                        Copy Link
                                    </button>
                                     <button 
                                        onClick={() => {
                                            setShowShareMenu(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <p className="text-sm font-bold mt-2">{likeCount.toLocaleString()} likes</p>
                
                {post.content.text && (
                    <div className="mt-1 text-sm">
                        <span className="font-bold mr-2 cursor-pointer" onClick={() => onSelectProfile(post.user)}>{post.user.name}</span>
                        <span>{post.content.text}</span>
                    </div>
                )}
                
                 {post.music && (
                    <div className="mt-2 text-xs flex items-center text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 w-fit px-2 py-1 rounded-full">
                        <MusicIcon />
                        <span className="ml-2 font-medium">{post.music.title} • {post.music.artist}</span>
                    </div>
                 )}

                <button onClick={() => setCommentsVisible(!commentsVisible)} className="text-sm text-slate-500 mt-2">
                   {commentsVisible ? 'Hide comments' : `View all ${comments.length} comments`}
                </button>

                {commentsVisible && (
                    <div className="mt-3 space-y-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                        {comments.map(c => <CommentComponent key={c.id} comment={c} onReply={handleReply} onLike={handleLikeComment} />)}
                        
                        <div className="relative pt-2">
                             {replyTo && (
                                <div className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 p-1 rounded-t-md flex justify-between items-center">
                                    <span>Replying to <span className="font-bold">{replyTo.user}</span></span>
                                    <button onClick={() => setReplyTo(null)} className="px-2 font-bold text-slate-400">×</button>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <input
                                    ref={commentInputRef}
                                    type="text"
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handlePostComment()}
                                    placeholder="Add a comment..."
                                    className={`flex-grow bg-slate-100 dark:bg-slate-800 text-sm p-3 outline-none ${replyTo ? 'rounded-b-xl rounded-tr-xl' : 'rounded-xl'}`}
                                />
                                <button onClick={handlePostComment} className="p-2 text-blue-500 font-bold disabled:text-slate-400 disabled:cursor-not-allowed" disabled={!newComment.trim()}>Post</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Main Social Component
const Social: React.FC<{ setActiveTab: (tab: Tab) => void; showNotification?: (msg: string) => void }> = ({ setActiveTab, showNotification }) => {
  const [posts, setPosts] = useState<Post[]>(mockPosts.filter(p => !p.content.videoUrl));
  const [viewingProfile, setViewingProfile] = useState<User | null>(null);
  const [viewingStory, setViewingStory] = useState<Story | null>(null);
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState<{url: string, file: File} | null>(null);
  const [newPostLocation, setNewPostLocation] = useState<string | null>(null);
  const [newPostMusic, setNewPostMusic] = useState<Music | null>(null);
  const [imageStyle, setImageStyle] = useState<React.CSSProperties>({});
  const [showEditor, setShowEditor] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);
  
  // Pull to refresh state
  const [refreshing, setRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial Fetch & Realtime Subscription
  useEffect(() => {
    if (isSupabaseConfigured()) {
        fetchPosts();
        
        const channel = supabase.channel('public:posts')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'posts' },
                (payload) => {
                    // Adapt Supabase payload to Post type
                    const newRealtimePost: Post = {
                         id: payload.new.id,
                         user: { name: 'New User', avatar: 'https://picsum.photos/seed/user_new/200' }, // Simplified
                         timestamp: 'Just now',
                         content: {
                             text: payload.new.content,
                             imageUrl: payload.new.image_url,
                             videoUrl: payload.new.video_url
                         },
                         likes: 0
                    };
                    // Filter out video/reel posts from main feed if desired, or keep them.
                    // Assuming feed handles images mostly.
                    if (!payload.new.video_url) {
                        setPosts(prev => [newRealtimePost, ...prev]);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }
  }, []);

  const fetchPosts = async () => {
      if (!isSupabaseConfigured()) return;
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (data) {
          const mappedPosts: Post[] = data.map((p: any) => ({
              id: p.id,
              user: { name: 'User ' + p.user_id?.slice(0,5) || 'Anon', avatar: 'https://picsum.photos/seed/user_db/200' },
              timestamp: new Date(p.created_at).toLocaleTimeString(),
              content: {
                  text: p.content,
                  imageUrl: p.image_url,
                  videoUrl: p.video_url
              },
              likes: p.likes || 0
          }));
          // Merge with mock posts, filtering out ones that are specifically reels (videos) for the feed view if desired
          // But here we'll mix them or follow the previous logic of filtering out videoUrl from mockPosts
          setPosts([...mappedPosts.filter(p => !p.content.videoUrl), ...mockPosts.filter(p => !p.content.videoUrl)]);
      }
  };

  // Pull to refresh logic
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only enable pull to refresh if we are at the top of the container
    if (scrollRef.current && scrollRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;
      if (diff > 0) {
        // Apply resistance
        setPullY(diff * 0.4);
        // Prevent default browser refresh if possible (though complex in passive listeners)
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullY > 80) { // Threshold
      setRefreshing(true);
      // Simulate fetch delay or real fetch
      if (isSupabaseConfigured()) {
          await fetchPosts();
      } else {
          await new Promise(resolve => setTimeout(resolve, 1500));
          // Simulate new post
          const newMockPost: Post = {
               id: Date.now(),
               user: { name: 'Refreshed User', avatar: 'https://picsum.photos/200' },
               timestamp: 'Just now',
               content: { text: 'New content loaded from pull-to-refresh!' },
               likes: 0
          };
          setPosts(prev => [newMockPost, ...prev]);
      }
      setRefreshing(false);
    }
    setPullY(0);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          setNewPostImage({ url: URL.createObjectURL(file), file });
          event.target.value = '';
      }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            () => {
                setNewPostLocation("Freetown, Sierra Leone");
            },
            () => {
                alert("Could not get location. Please enable permissions.");
            }
        );
    }
  };
  
  const handleCreatePost = async () => {
    if (!newPostText.trim() && !newPostImage) {
        alert("Please add some text or an image to your post.");
        return;
    }

    let publicUrl = newPostImage?.url;

    // Supabase Upload
    if (isSupabaseConfigured() && newPostImage?.file) {
        try {
            const fileName = `${Date.now()}_${newPostImage.file.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('media')
                .upload(fileName, newPostImage.file);
            
            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage.from('media').getPublicUrl(fileName);
            publicUrl = urlData.publicUrl;

            // Insert into DB
            await supabase.from('posts').insert({
                content: newPostText,
                image_url: publicUrl,
                // user_id would typically come from auth session
            });

        } catch (e) {
            console.error("Upload failed", e);
            alert("Failed to upload to Supabase. Posting locally.");
        }
    }

    const newPost: Post = {
        id: Date.now(),
        user: { name: 'alex_doe', avatar: 'https://picsum.photos/seed/user3/200' },
        timestamp: 'Just now',
        location: newPostLocation || undefined,
        content: {
            text: newPostText,
            imageUrl: publicUrl,
        },
        likes: 0,
        commentsData: [],
        music: newPostMusic || undefined,
    };

    // If we inserted into Supabase, the subscription will handle it. 
    // But for instant feedback or fallback:
    setPosts([newPost, ...posts]);
    
    // Reset form
    setNewPostText('');
    setNewPostImage(null);
    setNewPostLocation(null);
    setNewPostMusic(null);
    setImageStyle({});
  };

  const handleShareToReels = async (post: Post) => {
      // Simulate or actually insert a Reel
      const content = post.content.imageUrl || post.content.videoUrl;
      if (!content) return;

      if (isSupabaseConfigured()) {
          try {
               await supabase.from('posts').insert({
                content: post.content.text || '',
                video_url: content, // We treat the image as a 'video' source for Reels logic for now, or assume it handles images
                // In a real app we might convert it to a video or have a separate 'type' field
                user_id: 'current_user_id', // Mocked
                likes: 0
            });
            if (showNotification) showNotification('Shared to Reels successfully!');
          } catch(e) {
              console.error(e);
          }
      } else {
          // Mock behavior
          if (showNotification) showNotification('Shared to Reels! (Mock)');
      }
  };

  if (viewingProfile) {
      return <UserProfile user={viewingProfile} posts={posts} onBack={() => setViewingProfile(null)} />;
  }

  return (
    <div className="bg-slate-50 dark:bg-black h-full flex flex-col">
      {viewingStory && <StoryViewer story={viewingStory} onClose={() => setViewingStory(null)} />}
      {showEditor && newPostImage && (
          <ImageEditorModal 
            imageUrl={newPostImage.url} 
            onClose={() => setShowEditor(false)} 
            onApplyFilter={setImageStyle}
          />
      )}
      {showMusicModal && (
          <MusicSelectionModal 
            onClose={() => setShowMusicModal(false)}
            onSelect={(music) => setNewPostMusic(music)}
           />
      )}
      <header className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-10 flex-shrink-0">
        <h1 className="text-xl font-bold">Vayama Social</h1>
        <button onClick={() => setActiveTab(Tab.CHAT)} className="p-2 -mr-2">
            <SendIcon />
        </button>
      </header>
      
      {/* Scrollable Container with Pull to Refresh Handlers */}
      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
          {/* Pull Indicator */}
          <div 
            className="flex items-center justify-center w-full absolute top-0 left-0 pointer-events-none transition-transform duration-200"
            style={{ 
                height: '60px', 
                transform: `translateY(${Math.min(pullY, 80) - 60}px)`,
                opacity: Math.min(pullY / 40, 1)
            }}
          >
              {refreshing ? (
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                  <span className="text-slate-500 text-sm font-semibold">Pull to refresh</span>
              )}
          </div>

          <div style={{ transform: `translateY(${Math.min(pullY, 80)}px)`, transition: pullY === 0 ? 'transform 0.3s ease-out' : 'none' }}>
              {/* Stories */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
                        {mockStories.map(story => (
                            <div key={story.id} onClick={() => setViewingStory(story)} className="flex-shrink-0 flex flex-col items-center space-y-1 cursor-pointer group">
                                <div className={`w-16 h-16 rounded-full p-0.5 ${story.id > 1 ? 'bg-gradient-to-tr from-yellow-400 to-red-500' : 'bg-slate-300'} group-hover:scale-105 transition-transform`}>
                                    <img src={story.avatar} alt={story.name} className="w-full h-full rounded-full object-cover border-2 border-white dark:border-black"/>
                                </div>
                                <p className="text-xs w-16 truncate text-center">{story.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

            {/* Create Post */}
            <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <textarea
                    value={newPostText}
                    onChange={e => setNewPostText(e.target.value)}
                    placeholder="What's on your travel mind?"
                    className="w-full bg-slate-100 dark:bg-slate-800 p-2 rounded-xl outline-none text-sm resize-none"
                    rows={2}
                />
                {newPostImage && (
                    <div className="mt-2 relative">
                        <img src={newPostImage.url} style={imageStyle} alt="Post preview" className="rounded-xl max-h-60 w-full object-cover"/>
                        <button onClick={() => setNewPostImage(null)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full h-6 w-6 text-sm flex items-center justify-center">x</button>
                        <button onClick={() => setShowEditor(true)} className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md">Edit</button>
                    </div>
                )}
                {(newPostLocation || newPostMusic) && (
                    <div className="mt-2 space-y-1">
                        {newPostLocation && (
                            <div className="text-xs flex items-center text-blue-500 bg-blue-500/10 p-1.5 rounded-lg w-fit">
                                <LocationMarkerIcon className="h-4 w-4 mr-1"/>
                                {newPostLocation}
                                <button onClick={() => setNewPostLocation(null)} className="font-bold ml-2 text-red-500 px-1">×</button>
                            </div>
                        )}
                        {newPostMusic && (
                            <div className="text-xs flex items-center text-purple-500 bg-purple-500/10 p-1.5 rounded-lg w-fit">
                                <MusicIcon />
                                <span className="ml-2">{newPostMusic.title}</span>
                                <button onClick={() => setNewPostMusic(null)} className="font-bold ml-2 text-red-500 px-1">×</button>
                            </div>
                        )}
                    </div>
                )}
                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden"/>
                        <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><PhotoIcon /></button>
                        <button onClick={() => alert('Camera access is a mock feature. Select from gallery.')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><CameraIcon /></button>
                        <button onClick={handleGetLocation} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><LocationMarkerIcon /></button>
                        <button onClick={() => setShowMusicModal(true)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><MusicIcon /></button>
                    </div>
                    <button onClick={handleCreatePost} className="bg-blue-600 text-white font-bold py-1.5 px-5 rounded-full text-sm hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-all shadow-md" disabled={!newPostText.trim() && !newPostImage}>
                        Post
                    </button>
                </div>
            </div>
            
            {/* Posts Feed */}
            <div className="pb-20 bg-slate-100 dark:bg-black">
                {posts.map(post => <PostComponent key={post.id} post={post} onSelectProfile={setViewingProfile} onShareToReels={handleShareToReels} />)}
            </div>
          </div>
      </div>
    </div>
  );
};

export default Social;