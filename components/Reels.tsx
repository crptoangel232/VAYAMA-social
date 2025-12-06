import React, { useState, useRef, useEffect } from 'react';
import { Post } from '../types';
import { mockPosts } from '../data/mockData';
import { LikeIcon, CommentIcon, ShareIcon, MusicIcon } from './common/icons';

const Reel: React.FC<{ post: Post; isVisible: boolean }> = ({ post, isVisible }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes);

    useEffect(() => {
        if (isVisible) {
            videoRef.current?.play().catch(error => {
                console.log("Autoplay was prevented: ", error);
            });
        } else {
            videoRef.current?.pause();
        }
    }, [isVisible]);
    
    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    };

    return (
        <div className="h-full w-full relative snap-start flex items-center justify-center bg-black">
            <video
                ref={videoRef}
                src={post.content.videoUrl}
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                onClick={e => e.currentTarget.paused ? e.currentTarget.play() : e.currentTarget.pause()}
            ></video>
            <div className="absolute bottom-16 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
                <div className="flex items-end">
                    <div className="flex-grow">
                        <div className="flex items-center space-x-2">
                            <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full object-cover border-2 border-white" />
                            <p className="font-bold text-sm">{post.user.name}</p>
                        </div>
                        <p className="text-sm mt-2">{post.content.text}</p>
                        {post.music && (
                            <div className="mt-2 text-xs flex items-center">
                                <MusicIcon />
                                <span className="ml-2">{post.music.title} - {post.music.artist}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col items-center space-y-6">
                        <button onClick={handleLike} className="flex flex-col items-center">
                            <LikeIcon isLiked={isLiked} className="h-8 w-8" />
                            <span className="text-xs font-semibold">{likeCount}</span>
                        </button>
                        <button className="flex flex-col items-center">
                            <CommentIcon />
                            <span className="text-xs font-semibold">{post.commentsData?.length || 0}</span>
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

    const videoPosts = mockPosts.filter(p => p.content.videoUrl);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setVisibleReelId(Number(entry.target.getAttribute('data-id')));
                    }
                });
            },
            { threshold: 0.7 }
        );

        const reelElements = reelsContainerRef.current?.children;
        if (reelElements) {
             if (videoPosts.length > 0 && !visibleReelId) {
                setVisibleReelId(videoPosts[0].id);
            }
            Array.from(reelElements).forEach(el => observer.observe(el as Element));
        }

        return () => {
            if (reelElements) {
                Array.from(reelElements).forEach(el => observer.unobserve(el as Element));
            }
        };
    }, [videoPosts, visibleReelId]);
    
    if (!videoPosts.length) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-black text-white">
                <p>No reels available right now.</p>
            </div>
        );
    }

    return (
        <div ref={reelsContainerRef} className="h-full w-full overflow-y-auto snap-y snap-mandatory bg-black">
           {videoPosts.map((post) => (
               <div key={post.id} data-id={post.id} className="h-full w-full snap-start">
                   <Reel post={post} isVisible={visibleReelId === post.id} />
               </div>
           ))}
        </div>
    );
};

export default Reels;