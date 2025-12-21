"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { withAuth } from "@/components/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  MessageCircle,
  Share,
  TrendingUp,
  UserPlus,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const posts = [
  {
    id: 1,
    user: {
      name: "SakuraKid",
      avatar: "/anime-style-avatar-girl.png",
      level: "N4",
    },
    content:
      "Just passed my first JLPT practice test! The kanji flashcards really helped. Θáæσ╝╡πüúπüª∩╝ü Anyone else preparing for December?",
    image: null,
    likes: 24,
    comments: 8,
    timeAgo: "2 hours ago",
    liked: false,
  },
  {
    id: 2,
    user: {
      name: "TokyoMaster",
      avatar: "/anime-style-avatar-boy.png",
      level: "N2",
    },
    content:
      "Pro tip: When learning new vocabulary, try to use it in sentences immediately. Context makes everything stick better! Here's my study setup:",
    image: "/japanese-study-setup-desk.png",
    likes: 42,
    comments: 15,
    timeAgo: "4 hours ago",
    liked: true,
  },
  {
    id: 3,
    user: {
      name: "YukiLearner",
      avatar: "/anime-style-avatar-woman.png",
      level: "N5",
    },
    content:
      "Finally memorized all hiragana! The spaced repetition system here is amazing. Moving on to katakana next week. πüéπéèπüîπü¿πüåπüöπüûπüäπü╛πüÖ∩╝ü",
    image: null,
    likes: 18,
    comments: 6,
    timeAgo: "6 hours ago",
    liked: false,
  },
  {
    id: 4,
    user: {
      name: "KanjiNinja",
      avatar: "/anime-style-avatar-man.png",
      level: "N1",
    },
    content:
      "Today I learned that Θ¢¿ (rain) + Θ¢▓ (cloud) doesn't make a compound word, but Θ¢¿Θ¢▓ (rain cloud) does exist! Japanese is fascinating. What's your favorite kanji discovery?",
    image: null,
    likes: 31,
    comments: 12,
    timeAgo: "8 hours ago",
    liked: false,
  },
  {
    id: 5,
    user: {
      name: "OsakaBenLover",
      avatar: "/anime-style-avatar-girl-2.png",
      level: "N3",
    },
    content:
      "Started learning Kansai dialect and it's so different from standard Japanese! πüáπéôπüáπéô instead of πüéπéèπüîπü¿πüå is my new favorite. Anyone else studying dialects?",
    image: "/osaka-street-scene.png",
    likes: 27,
    comments: 9,
    timeAgo: "12 hours ago",
    liked: true,
  },
];

const trendingTopics = [
  { tag: "#JLPT2024", posts: 234 },
  { tag: "#KanjiOfTheDay", posts: 189 },
  { tag: "#StudyTips", posts: 156 },
  { tag: "#JapaneseGrammar", posts: 143 },
  { tag: "#AnimeJapanese", posts: 98 },
];

const friendSuggestions = [
  {
    name: "HiroshiSensei",
    avatar: "/anime-style-avatar-teacher.png",
    level: "Native",
    mutualFriends: 12,
  },
  {
    name: "MangaReader99",
    avatar: "/anime-style-avatar-boy-2.png",
    level: "N3",
    mutualFriends: 8,
  },
  {
    name: "TokyoLife",
    avatar: "/anime-style-avatar-woman-2.png",
    level: "N2",
    mutualFriends: 5,
  },
];

function CommunityPage() {
  const [postLikes, setPostLikes] = useState<
    Record<number, { liked: boolean; count: number }>
  >(
    posts.reduce(
      (acc, post) => ({
        ...acc,
        [post.id]: { liked: post.liked, count: post.likes },
      }),
      {}
    )
  );
  const [newPost, setNewPost] = useState("");

  const handleLike = (postId: number) => {
    setPostLikes((prev) => ({
      ...prev,
      [postId]: {
        liked: !prev[postId].liked,
        count: prev[postId].liked
          ? prev[postId].count - 1
          : prev[postId].count + 1,
      },
    }));
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Main Feed */}
      <div className="flex-1 max-w-2xl mx-auto p-6">
        {/* Create Post */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Avatar>
                <AvatarImage src="/anime-style-avatar-user.png" />
                <AvatarFallback>You</AvatarFallback>
              </Avatar>
              <div className="flex-1 ">
                <Textarea
                  placeholder="Share your Japanese learning journey..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[80px] resize-none border-0 p-3 focus-visible:ring-0 "
                />
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <Button variant="ghost" size="sm">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Photo
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    disabled={!newPost.trim()}
                  >
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={post.user.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {post.user.name?.[0] ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{post.user.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {post.user.level} Level
                      </Badge>
                      <span className="text-sm text-muted-foreground">ΓÇó</span>
                      <span className="text-sm text-muted-foreground">
                        {post.timeAgo}
                      </span>
                    </div>
                    <p className="text-foreground mb-3 leading-relaxed">
                      {post.content}
                    </p>
                    {post.image && (
                      <div className="mb-3">
                        <img
                          src={post.image || "/placeholder.svg"}
                          alt="Post image"
                          className="rounded-lg max-w-full h-auto"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "p-0 h-auto hover:text-primary",
                          postLikes[post.id]?.liked && "text-primary"
                        )}
                        onClick={() => handleLike(post.id)}
                      >
                        <Heart
                          className={cn(
                            "h-4 w-4 mr-1",
                            postLikes[post.id]?.liked && "fill-current"
                          )}
                        />
                        {postLikes[post.id]?.count || post.likes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto hover:text-primary"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {post.comments}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto hover:text-primary"
                      >
                        <Share className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 p-6 space-y-6">
        {/* Trending Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Trending Topics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trendingTopics.map((topic, index) => (
              <div
                key={topic.tag}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-primary hover:underline cursor-pointer">
                    {topic.tag}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {topic.posts} posts
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  #{index + 1}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Friend Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="h-5 w-5 text-primary" />
              People to Follow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {friendSuggestions.map((friend) => (
              <div key={friend.name} className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={friend.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{friend.name?.[0] ?? "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm">{friend.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {friend.level}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {friend.mutualFriends} mutual friends
                    </span>
                  </div>
                </div>
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Follow
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Study Groups */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Study Groups</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 border border-border rounded-lg">
              <p className="font-medium text-sm">JLPT N3 Study Group</p>
              <p className="text-xs text-muted-foreground">
                124 members ΓÇó Daily practice
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full bg-transparent"
              >
                Join Group
              </Button>
            </div>
            <div className="p-3 border border-border rounded-lg">
              <p className="font-medium text-sm">Kanji Masters</p>
              <p className="text-xs text-muted-foreground">
                89 members ΓÇó Advanced learners
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full bg-transparent"
              >
                Join Group
              </Button>
            </div>
            <div className="p-3 border border-border rounded-lg">
              <p className="font-medium text-sm">Anime Japanese Club</p>
              <p className="text-xs text-muted-foreground">
                256 members ΓÇó Learn through anime
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full bg-transparent"
              >
                Join Group
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(CommunityPage);
