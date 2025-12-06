import React, { useState, useRef, useEffect } from 'react';
import { Post } from '../types';
import { mockPosts } from '../data/mockData';
import { LikeIcon, CommentIcon, ShareIcon, MusicIcon } from './common/icons';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const Reel: React.FC<{ post: Post; isVisible: boolean }> = ({ post, isVisible }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes);

    useEffect(() => {
        if (isVisible) {
            // Attempt to play, handling promise rejections (e.g. low power mode, interactions needed)
            const playPromise = videoRef.current?.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // console.log("Autoplay prevented");
                });
            }
        } else {
            videoRef.current?.pause();
        }
    }, [isVisible]);
    
    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    };
    
    // Determine media type. If videoUrl is present, it's a video. If only imageUrl, treat as a static reel.
    const isVideo = !!post.content.videoUrl;

    return (
        <div className="h-full w-full relative snap-start flex items-center justify-center bg-black">
            {isVideo ? (
                 <video
                    ref={videoRef}
                    src={post.content.videoUrl}
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    onClick={e => e.currentTarget.paused ? e.currentTarget.play() : e.currentTarget.pause()}
                ></video>
            ) : (
                <img 
                    src={post.content.imageUrl} 
                    alt="Reel content" 
                    className="w-full h-full object-cover animate-[zoomIn_20s_infinite_alternate]"
                />
            )}
           
            <div className="absolute bottom-16 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
                <div className="flex items-end">
                    <div className="flex-grow">
                        <div className="flex items-center space-x-2">
                            <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full object-cover border-2 border-white" />
                            <p className="font-bold text-sm shadow-black drop-shadow-md">{post.user.name}</p>
                        </div>
                        <p className="text-sm mt-2 shadow-black drop-shadow-md">{post.content.text}</p>
                        {post.music && (
                            <div className="mt-2 text-xs flex items-center">
                                <MusicIcon />
                                <span className="ml-2">{post.music.title} - {post.music.artist}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col items-center space-y-6">
                        <button onClick={handleLike} className="flex flex-col items-center">
                            <LikeIcon isLiked={isLiked} className="h-8 w-8 drop-shadow-lg" />
                            <span className="text-xs font-semibold drop-shadow-lg">{likeCount}</span>
                        </button>
                        <button className="flex flex-col items-center">
                            <CommentIcon />
                            <span className="text-xs font-semibold drop-shadow-lg">{post.commentsData?.length || 0}</span>
                        </button>
                         <button className="flex flex-col items-center">
                            <ShareIcon />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const Reels: React.FC = () => {
    const reelsContainerRef = useRef<HTMLDivElement>(null);
    const [visibleReelId, setVisibleReelId] = useState<number | null>(null);
    const [reels, setReels] = useState<Post[]>([]);

    useEffect(() => {
        // Initial Mock Data (filtered for items that have visual content suitable for reels)
        // Traditionally Reels are videos, but we will allow images to be "shared to reels" as static/animated slides for this demo.
        const initialReels = mockPosts.filter(p => p.content.videoUrl);
        setReels(initialReels);

        // Fetch from Supabase
        if (isSupabaseConfigured()) {
            const fetchReels = async () => {
                 const { data, error } = await supabase
                    .from('posts')
                    .select('*')
                    .not('video_url', 'is', null) // Fetch posts that are explicitly videos/reels
                    .order('created_at', { ascending: false });
                
                if (data) {
                    const sbReels: Post[] = data.map((p: any) => ({
                        id: p.id,
                        user: { name: 'User ' + p.user_id?.slice(0,5) || 'Anon', avatar: 'https://picsum.photos/seed/user_db/200' },
                        timestamp: 'Reel',
                        content: {
                            text: p.content,
                            imageUrl: p.image_url,
                            videoUrl: p.video_url
                        },
                        likes: p.likes || 0
                    }));
                    // Combine, preferring SB data on top
                    setReels(prev => [...sbReels, ...prev]);
                }
            };
            fetchReels();

             // Realtime listener for new reels
            const channel = supabase.channel('public:reels')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'posts' },
                (payload) => {
                     if (payload.new.video_url) {
                         const newReel: Post = {
                             id: payload.new.id,
                             user: { name: 'New Reel', avatar: 'https://picsum.photos/seed/reel_new/200' },
                             timestamp: 'Just now',
                             content: {
                                 text: payload.new.content,
                                 imageUrl: payload.new.image_url,
                                 videoUrl: payload.new.video_url
                             },
                             likes: 0
                        };
                        setReels(prev => [newReel, ...prev]);
                     }
                }
            )
            .subscribe();
            return () => { supabase.removeChannel(channel); }
        }
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setVisibleReelId(Number(entry.target.getAttribute('data-id')));
                    }
                });
            },
            { threshold: 0.6 }
        );

        const reelElements = reelsContainerRef.current?.children;
        if (reelElements && reels.length > 0) {
            // Default first if none
            if (!visibleReelId && reels[0]) {
                setVisibleReelId(reels[0].id);
            }
            Array.from(reelElements).forEach(el => observer.observe(el as Element));
        }

        return () => {
            if (reelElements) {
                Array.from(reelElements).forEach(el => observer.unobserve(el as Element));
            }
        };
    }, [reels, visibleReelId]);
    
    if (reels.length === 0) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-black text-white">
                <p>No reels available.</p>
            </div>
        );
    }

    return (
        <div ref={reelsContainerRef} className="h-full w-full overflow-y-auto snap-y snap-mandatory bg-black no-scrollbar">
           {reels.map((post) => (
               <div key={post.id} data-id={post.id} className="h-full w-full snap-start relative">
                   <Reel post={post} isVisible={visibleReelId === post.id} />
               </div>
           ))}
        </div>
    );
};

export default Reels;