import { Post } from '../types';

export const mockStories = [
    { id: 1, name: 'Your Story', avatar: 'https://picsum.photos/seed/my_story/200', contentUrl: 'https://picsum.photos/seed/story_content1/400/800' },
    { id: 2, name: 'JaneDoe', avatar: 'https://picsum.photos/seed/4/200', contentUrl: 'https://picsum.photos/seed/story_content2/400/800' },
    { id: 3, name: 'AfricanFoodie', avatar: 'https://picsum.photos/seed/user2/200', contentUrl: 'https://picsum.photos/seed/story_content3/400/800' },
    { id: 4, name: 'SLTrips', avatar: 'https://picsum.photos/seed/user1/200', contentUrl: 'https://picsum.photos/seed/story_content4/400/800' },
    { id: 5, name: 'TravelPro', avatar: 'https://picsum.photos/seed/user5/200', contentUrl: 'https://picsum.photos/seed/story_content5/400/800' },
    { id: 6, name: 'LocalGuide', avatar: 'https://picsum.photos/seed/user6/200', contentUrl: 'https://picsum.photos/seed/story_content6/400/800' },
];

export const mockPosts: Post[] = [
  {
    id: 101,
    user: { name: 'VayamaAdventures', avatar: 'https://picsum.photos/seed/user101/200' },
    timestamp: '30m ago',
    location: 'Tokeh Beach',
    content: {
      text: 'Waves crashing, sun setting. This is the life! 🌊☀️ #SierraLeone #BeachVibes',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    },
    likes: 352,
    commentsData: [
        { id: 'vc1-1', user: 'JaneDoe', text: 'Looks amazing!', likes: 2}
    ],
    music: { title: 'Ocean Drive', artist: 'Lighthouse' }
  },
  {
    id: 102,
    user: { name: 'AfricanFoodie', avatar: 'https://picsum.photos/seed/user2/200' },
    timestamp: '1h ago',
    location: 'Freetown Market',
    content: {
      text: 'The hustle and bustle of a Freetown market is something else! So many colors and sounds.',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    },
    likes: 210,
    commentsData: [
         { id: 'vc2-1', user: 'TravelPro', text: 'I can almost smell the spices!', likes: 4 }
    ],
    music: { title: 'Market Day', artist: 'Krio Jazz Collective' }
  },
   {
    id: 103,
    user: { name: 'SierraLeoneTrips', avatar: 'https://picsum.photos/seed/user1/200' },
    timestamp: '4h ago',
    location: 'Outamba-Kilimi National Park',
    content: {
      text: 'Exploring the incredible nature of Sierra Leone.',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    },
    likes: 541,
    commentsData: [],
    music: { title: 'Jungle Beat', artist: 'Salone Beats' }
  },
  {
    id: 1,
    user: { name: 'SierraLeoneTrips', avatar: 'https://picsum.photos/seed/user1/200' },
    timestamp: '2h ago',
    location: 'Lumley Beach, Freetown',
    content: {
      text: 'Just captured this incredible sunset at Lumley Beach! Freetown never disappoints. #SaloneTravel #Vayama',
      imageUrl: 'https://picsum.photos/seed/post1/600/400',
    },
    likes: 124,
    commentsData: [
        { id: 'c1-1', user: 'JaneDoe', text: 'Stunning shot! 😍', likes: 5, replies: [
            { id: 'c1-1-1', user: 'SierraLeoneTrips', text: 'Thank you!', likes: 2 }
        ]},
        { id: 'c1-2', user: 'TravelPro', text: 'I need to visit next year.', likes: 3 },
    ],
    music: { title: 'Freetown Breeze', artist: 'Salone Beats' }
  },
  {
    id: 2,
    user: { name: 'AfricanFoodie', avatar: 'https://picsum.photos/seed/user2/200' },
    timestamp: '5h ago',
    location: 'Freetown, Sierra Leone',
    content: {
      text: 'Trying out the famous Jollof Rice here in Freetown. The spice is perfect! Highly recommend this spot.',
      imageUrl: 'https://picsum.photos/seed/post2/600/400',
    },
    likes: 88,
    commentsData: [
         { id: 'c2-1', user: 'alex_doe', text: 'That looks delicious!', likes: 1 }
    ]
  },
  {
    id: 3,
    user: { name: 'alex_doe', avatar: 'https://picsum.photos/seed/user3/200' },
    timestamp: '1d ago',
    content: {
      text: 'My trip to Bo was amazing! The AI planner on Vayama made it so easy to organize everything. So impressed!',
    },
    likes: 45,
    commentsData: [],
  },
];