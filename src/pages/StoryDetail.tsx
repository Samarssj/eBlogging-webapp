import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Bookmark, BookOpen, Clock3, Heart, Share2, Sparkles } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { BlogHeader } from '@/components/BlogHeader';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { api, ApiComment, ApiPost } from '@/lib/api';
import { CommentSection } from '@/components/CommentSection';
import { isAuthenticated } from '@/lib/auth';

type Story = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  readTime: string;
  category: string;
  image: string;
  quote?: string;
  paragraphs: string[];
  persisted?: boolean;
};

const storyCatalog: Record<string, Story> = {
  '1': {
    id: '1', title: 'Designing with Purpose: A Guide to User-Centric Web Design', excerpt: 'The best digital experiences do more than look beautiful. They anticipate needs, remove friction, and leave people feeling understood.', author: 'Sarah Chen', publishedAt: '2 hours ago', readTime: '5 min', category: 'Design', image: '/images/feed/design-purpose.webp', quote: 'Good design is not decoration. It is a quiet act of care.', paragraphs: ['A useful interface begins long before a color palette is chosen. It begins with a question: what is someone trying to do, and what might make that harder than it needs to be?', 'The strongest products make their logic visible. They use hierarchy, pacing, and feedback to help people feel oriented instead of tested. Every detail becomes an invitation to continue.', 'When design starts with real behavior, visual polish becomes more than a surface. It becomes evidence that the product understands the person using it.'],
  },
  '2': {
    id: '2', title: 'The Future of Web Development Is More Human Than We Think', excerpt: 'AI is changing the tools we use, but the most important shift is still the same: building technology around real human behavior.', author: 'Alex Rodriguez', publishedAt: '6 hours ago', readTime: '8 min', category: 'Technology', image: '/images/feed/future-web.webp', quote: 'The best tools give people more room to think, not more things to manage.', paragraphs: ['The conversation around the future of the web often begins with tools. But tools are only interesting because of the people they help us serve.', 'As automation becomes more capable, the work that matters most will be the work that asks better questions: what should be built, who is it for, and what does a responsible experience feel like?', 'A more human web is not a retreat from technology. It is a commitment to use technology with enough attention to leave room for judgment, empathy, and curiosity.'],
  },
  '3': {
    id: '3', title: 'Mastering TypeScript: From Beginner to Confident Builder', excerpt: 'A practical path through types, generics, and the habits that make TypeScript feel less like ceremony and more like a creative partner.', author: 'Emily Watson', publishedAt: '1 day ago', readTime: '12 min', category: 'Development', image: '/images/feed/typescript.webp', quote: 'Types are most useful when they make the next decision easier.', paragraphs: ['TypeScript becomes approachable when it is treated as a design tool rather than a wall of rules. Start with the shape of the data you already understand, then let the compiler show you where the edges are.', 'Generics and utility types are not magic tricks. They are ways to name patterns that appear more than once, so a team can reason about them together.', 'The goal is not to annotate everything. The goal is to make intent visible enough that future changes feel safer.'],
  },
  '4': {
    id: '4', title: 'A Slow Morning in a Fast-Moving City', excerpt: 'Notes on attention, small rituals, and finding enough quiet to hear your own ideas arrive.', author: 'Maya Patel', publishedAt: '2 days ago', readTime: '6 min', category: 'Culture', image: '/images/feed/slow-morning.webp', quote: 'A slower pace is sometimes the fastest route back to yourself.', paragraphs: ['The city does not really become quiet. We become better at noticing the quiet that is already there: the first cup, the empty train seat, the light moving across a table.', 'Small rituals are not an escape from ambitious work. They are how attention gets restored. They remind us that a day is made of moments, not just milestones.', 'There is no productivity lesson here, at least not one that fits neatly on a screen. There is only the permission to begin gently.'],
  },
  '5': {
    id: '5', title: 'The Creative Habit: Small Systems for Big Ideas', excerpt: 'A gentle framework for capturing sparks, protecting focus, and turning unfinished notes into work you are proud to share.', author: 'Noah Williams', publishedAt: '3 days ago', readTime: '7 min', category: 'Creativity', image: '/images/feed/creative-habit.webp', quote: 'Creativity needs a place to land before it needs an audience.', paragraphs: ['Ideas rarely arrive in a finished form. They show up as fragments, odd connections, or a sentence that feels worth keeping for reasons you cannot yet explain.', 'A simple capture habit lowers the pressure to perform. Once the idea has a home, you can return to it with more patience and less fear of losing it.', 'The creative system that lasts is usually the one that makes returning easy. Small, repeatable rituals create the conditions for bigger work.'],
  },
  '6': {
    id: '6', title: 'Building a Personal Knowledge Garden', excerpt: 'What happens when your notes become a living landscape instead of another folder full of links you never revisit.', author: 'Owen Brooks', publishedAt: '4 days ago', readTime: '9 min', category: 'Productivity', image: '/images/feed/knowledge-garden.webp', quote: 'A useful note is not stored knowledge; it is a path back to a useful thought.', paragraphs: ['A knowledge garden grows through revisiting. The first note can be messy. The value appears later, when a new idea gives an old one a different shape.', 'Instead of collecting everything, keep the pieces that help you ask, make, or explain something. Connect notes with language that makes sense to your future self.', 'Over time, the garden becomes less a library and more a map of how you think.'],
  },
  '7': {
    id: '7', title: 'Why Curiosity Is a Better Career Compass Than Certainty', excerpt: 'The questions we keep returning to can reveal more about our next chapter than any five-year plan.', author: 'Priya Shah', publishedAt: '5 days ago', readTime: '8 min', category: 'Perspective', image: '/images/feed/curiosity-compass.webp', quote: 'A good question can be a direction without pretending to be a destination.', paragraphs: ['Certainty is comforting because it sounds like a map. But most meaningful work begins with an interest that has not yet become a plan.', 'Curiosity gives us permission to follow evidence. It helps us notice which problems keep pulling us back and which environments make us feel more awake.', 'The next step does not need to define the rest of a career. It only needs to create a little more information than the step before it.'],
  },
  '8': {
    id: '8', title: 'The Night Sky Is a Reminder to Think in Longer Timelines', excerpt: 'A field note on scale, patience, and the strange comfort of remembering that every breakthrough starts small.', author: 'Elias Green', publishedAt: '1 week ago', readTime: '5 min', category: 'Science', image: '/images/feed/night-sky.webp', quote: 'Long timelines do not make small actions irrelevant. They make them meaningful.', paragraphs: ['The night sky changes the scale of a problem. A single idea can feel tiny and still belong to a story that is much larger than a single day or career.', 'Patience is not passive. It is the practice of doing the next careful thing without needing immediate proof that it will matter.', 'The work we keep returning to is often already telling us what it wants to become.'],
  },
  t1: {
    id: 't1', title: 'The Rise of AI in Software Development: A Complete Guide', excerpt: 'Exploring how artificial intelligence is transforming the way we write code, debug applications, and architect software systems.', author: 'Dr. Sarah Martinez', publishedAt: '12 hours ago', readTime: '15 min', category: 'AI / ML', image: '/images/trending/ai-development.webp', quote: 'The most valuable part of an AI workflow is still the human review between steps.', paragraphs: ['AI-assisted development is moving quickly, but speed is not the only measure of a good engineering system. The better question is whether the new tool helps a team make more deliberate decisions.', 'The strongest workflows treat generated output as a draft: useful, inspectable, and always subject to context. Code review, testing, and clear ownership remain essential.', 'The opportunity is not to remove craft from software. It is to move craft toward the decisions that require the most judgment.'],
  },
  t2: {
    id: 't2', title: 'Building Scalable React Applications: Lessons from Production', excerpt: 'Real-world insights from scaling React apps to millions of users, from state management to architecture decisions.', author: 'Alex Chen', publishedAt: '1 day ago', readTime: '12 min', category: 'React', image: '/images/trending/react-production.webp', quote: 'Scale is less about one perfect abstraction and more about making change predictable.', paragraphs: ['Production scale reveals the seams in an application. Components that felt independent begin to share assumptions, and state that once lived locally starts affecting an entire experience.', 'The answer is rarely a single architecture diagram. It is a set of boundaries that make ownership and performance visible to the team.', 'When rendering, data, and interaction responsibilities are clear, React can stay flexible without becoming mysterious.'],
  },
  t3: {
    id: 't3', title: 'The Future of Web Development: What to Expect Next', excerpt: 'A comprehensive look at emerging technologies, frameworks, and development practices that will shape the web.', author: 'Maria Rodriguez', publishedAt: '2 days ago', readTime: '10 min', category: 'Web Development', image: '/images/trending/web-future.webp', quote: 'The future belongs to teams that can learn faster than the stack changes.', paragraphs: ['The web keeps changing, but the durable skills are familiar: understand users, model data clearly, make performance visible, and communicate decisions well.', 'New frameworks will continue to arrive. The advantage comes from knowing which problems deserve a new tool and which ones deserve a simpler solution.', 'The next era of web development will be shaped as much by taste and judgment as by technical capability.'],
  },
  t4: {
    id: 't4', title: 'Designing for Trust in an Age of Infinite Interfaces', excerpt: 'Small details that make digital products feel more transparent, dependable, and worthy of someone’s attention.', author: 'Jules Park', publishedAt: '3 days ago', readTime: '9 min', category: 'UI / UX', image: '/images/trending/design-trust.webp', quote: 'Trust is built when the interface keeps its promises in small moments.', paragraphs: ['Trust is rarely won by a single feature. It is accumulated through predictable feedback, honest labels, sensible defaults, and enough room for a person to change their mind.', 'The interface should make consequences visible without making the user anxious. Clarity is a form of respect.', 'When a product behaves consistently, people can spend their attention on the task instead of decoding the tool.'],
  },
  t5: {
    id: 't5', title: 'TypeScript Patterns That Make Teams Move Faster', excerpt: 'A practical collection of type patterns that reduce bugs, improve code review, and make complex systems easier to navigate.', author: 'Theo Brooks', publishedAt: '4 days ago', readTime: '11 min', category: 'TypeScript', image: '/images/trending/typescript-patterns.webp', quote: 'The best type system is the one that helps the whole team see the same shape.', paragraphs: ['Patterns become valuable when they remove repeated conversations. A shared type can explain the contract between a component, an API, and the person maintaining it later.', 'Use the language to make invalid states harder to represent, but keep the model readable enough that a new teammate can enter the system.', 'Faster teams are not teams that type less. They are teams that spend less time rediscovering assumptions.'],
  },
  t6: {
    id: 't6', title: 'The Quiet Power of a Well-Timed Refactor', excerpt: 'How to recognize when technical debt is slowing the team down and make improvements without stopping momentum.', author: 'Amara Okafor', publishedAt: '5 days ago', readTime: '8 min', category: 'Engineering', image: '/images/trending/refactor.webp', quote: 'A refactor is successful when the next change becomes easier to explain.', paragraphs: ['Refactoring does not need to be dramatic. The most effective improvements often start with one boundary that has become difficult to understand.', 'Name the friction, reduce the surface area, and keep the behavior visible through tests or a small verification loop.', 'A calmer codebase is not just nicer to read. It is a more reliable place to make the next decision.'],
  },
  t7: {
    id: 't7', title: 'What We Get Wrong About Productivity Tools', excerpt: 'More dashboards do not always mean more clarity. A closer look at the tools and rituals that genuinely help.', author: 'Rina Das', publishedAt: '6 days ago', readTime: '7 min', category: 'Productivity', image: '/images/trending/productivity-tools.webp', quote: 'A tool is productive when it gives attention back to the work.', paragraphs: ['Productivity systems are easy to measure and difficult to feel. A full dashboard can still leave the important work untouched.', 'The best tools reduce decisions, surface the next useful action, and disappear when the work becomes absorbing.', 'Choose systems that support your attention instead of asking to become another place where your attention lives.'],
  },
  t8: {
    id: 't8', title: 'A Field Guide to Better Technical Writing', excerpt: 'Clear documentation is a product feature. These simple practices help ideas travel further across a team.', author: 'Jon Bell', publishedAt: '1 week ago', readTime: '6 min', category: 'Writing', image: '/images/trending/technical-writing.webp', quote: 'Documentation is a bridge between the decision that happened and the person who joins later.', paragraphs: ['Technical writing works when it respects the reader’s starting point. Give people the context they need, then show them the path to a useful outcome.', 'Examples are not decoration. They are executable explanations that let a reader compare their situation with the one being described.', 'Clear writing makes systems easier to operate because it turns private knowledge into a shared surface.'],
  },
  t9: {
    id: 't9', title: 'Why Open Source Communities Keep Reinventing Belonging', excerpt: 'The social patterns behind healthy contributor communities, and what product teams can learn from them.', author: 'Nadia Flores', publishedAt: '1 week ago', readTime: '8 min', category: 'Community', image: '/images/trending/open-source-community.webp', quote: 'People contribute more freely when the path into a community is visible.', paragraphs: ['Healthy communities are designed through small signals: welcoming documentation, clear contribution paths, generous feedback, and a shared sense of what the work is for.', 'Belonging is not a marketing layer. It is the result of repeated interactions that tell people their time and perspective are taken seriously.', 'The best communities make it possible for someone to arrive as a beginner and leave with a stronger sense of agency.'],
  },
};

const persistedStory = (post: ApiPost): Story => ({
  id: post.id,
  title: post.title,
  excerpt: post.excerpt,
  author: post.author.name,
  publishedAt: post.publishedAt || new Date(post.createdAt).toLocaleDateString(),
  readTime: `${Math.max(3, Math.ceil(post.content.trim().split(/\s+/).length / 180))} min`,
  category: 'Community',
  image: '/images/feed/curiosity-compass.webp',
  paragraphs: post.content.split(/\n{2,}/).filter(Boolean),
  persisted: true,
});

const isPersistedStoryId = (id?: string) => Boolean(id && (id.length === 24 || id.startsWith('legacy-post-')));

type DetailComment = {
  id: string;
  author: { name: string };
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies?: DetailComment[];
};

const toDetailComment = (comment: ApiComment): DetailComment => ({
  id: comment.id,
  author: { name: comment.author.name },
  content: comment.content,
  timestamp: comment.createdAt.includes('ago') ? comment.createdAt : new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
  likes: comment.likes,
  isLiked: Boolean(comment.likedByMe),
});

const updateDetailCommentTree = (comments: DetailComment[], commentId: string, updater: (comment: DetailComment) => DetailComment): DetailComment[] => comments.map((comment) => {
  if (comment.id === commentId) return updater(comment);
  if (comment.replies) return { ...comment, replies: updateDetailCommentTree(comment.replies, commentId, updater) };
  return comment;
});

const StoryDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState<DetailComment[]>([]);
  const [remoteStory, setRemoteStory] = useState<Story | null>(null);
  const [loadingRemoteStory, setLoadingRemoteStory] = useState(false);
  const story = postId ? storyCatalog[postId] || remoteStory : undefined;

  useEffect(() => {
    if (!postId || storyCatalog[postId] || !isPersistedStoryId(postId)) return;
    let active = true;
    setLoadingRemoteStory(true);
    Promise.all([
      api.get<{ post: ApiPost }>(`/api/posts/${postId}`, isAuthenticated()),
      api.get<{ comments: ApiComment[] }>(`/api/posts/${postId}/comments`),
    ]).then(([{ post }, { comments: remoteComments }]) => {
      if (active) {
        setRemoteStory(persistedStory(post));
        setLiked(post.likedByMe);
        setSaved(post.savedByMe);
        setComments(remoteComments.map(toDetailComment));
      }
    }).catch(() => { if (active) setRemoteStory(null); }).finally(() => { if (active) setLoadingRemoteStory(false); });
    return () => { active = false; };
  }, [postId]);

  const relatedStories = useMemo(() => Object.values(storyCatalog).filter((item) => item.id !== story?.id && item.category === story?.category).slice(0, 2), [story]);

  const checkAuth = () => {
    if (!isAuthenticated()) {
      toast({ title: 'Authentication required', description: 'Log in to like, comment on, or save stories.', variant: 'destructive' });
      navigate('/auth');
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!checkAuth()) return;
    const previousLiked = liked;
    const nextLiked = !previousLiked;
    setLiked(nextLiked);
    if (isPersistedStoryId(postId)) {
      try {
        const result = await api.post<{ liked: boolean }>(`/api/posts/${postId}/like`, {}, true);
        setLiked(result.liked);
        toast({ description: result.liked ? 'Story liked.' : 'Like removed.' });
      } catch (error) {
        setLiked(previousLiked);
        toast({ description: error instanceof Error ? error.message : 'Unable to update the like.', variant: 'destructive' });
      }
      return;
    }
  };

  const handleAddComment = async (content: string, parentId?: string) => {
    if (!checkAuth() || !postId || !isPersistedStoryId(postId)) return;

    const temporaryId = `pending-${Date.now()}`;
    const temporaryComment: DetailComment = {
      id: temporaryId,
      author: { name: 'You' },
      content,
      timestamp: 'now',
      likes: 0,
      isLiked: false,
    };
    setComments((current) => parentId
      ? updateDetailCommentTree(current, parentId, (parent) => ({ ...parent, replies: [...(parent.replies || []), temporaryComment] }))
      : [temporaryComment, ...current]);

    try {
      const result = await api.post<{ comment: ApiComment }>(`/api/posts/${postId}/comments`, { content, parentComment: parentId || null }, true);
      const persistedComment = toDetailComment(result.comment);
      setComments((current) => updateDetailCommentTree(current, temporaryId, () => persistedComment));
      toast({ description: 'Comment added.' });
    } catch (error) {
      setComments((current) => current
        .filter((comment) => comment.id !== temporaryId)
        .map((comment) => comment.replies ? { ...comment, replies: comment.replies.filter((reply) => reply.id !== temporaryId) } : comment));
      toast({ description: error instanceof Error ? error.message : 'Unable to add the comment.', variant: 'destructive' });
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!checkAuth()) return;
    const previous = comments;
    setComments((current) => updateDetailCommentTree(current, commentId, (comment) => ({ ...comment, isLiked: !comment.isLiked, likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1 })));
    try {
      const result = await api.post<{ likes: number; liked: boolean }>(`/api/comments/${commentId}/like`, {}, true);
      setComments((current) => updateDetailCommentTree(current, commentId, (comment) => ({ ...comment, isLiked: result.liked, likes: result.likes })));
    } catch (error) {
      setComments(previous);
      toast({ description: error instanceof Error ? error.message : 'Unable to update the comment like.', variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    if (!checkAuth()) return;
    if (isPersistedStoryId(postId)) {
      try {
        const result = await api.post<{ saved: boolean }>(`/api/posts/${postId}/save`, {}, true);
        setSaved(result.saved);
        toast({ description: result.saved ? 'Blog saved to your reading list.' : 'Blog removed from your reading list.' });
      } catch (error) { toast({ description: error instanceof Error ? error.message : 'Unable to update saved blogs.', variant: 'destructive' }); }
      return;
    }
    toast({ description: 'This editorial story is read-only; MongoDB-backed blogs can be saved after publishing.' });
  };

  const handleShare = async () => {
    try {
      if (navigator.share) await navigator.share({ title: story?.title, text: story?.excerpt, url: window.location.href });
      else if (navigator.clipboard) await navigator.clipboard.writeText(window.location.href);
      toast({ description: navigator.share ? 'Story shared.' : 'Story link copied to your clipboard.' });
    } catch {
      toast({ description: 'Sharing cancelled.' });
    }
  };

  if (loadingRemoteStory) {
    return <div className="min-h-screen bg-background"><BlogHeader /><main className="container mx-auto max-w-3xl px-4 py-24 text-center"><p className="font-serif text-4xl">Loading your story...</p><p className="mt-3 text-muted-foreground">Fetching the published blog from MongoDB.</p></main></div>;
  }

  if (!story) {
    return <div className="min-h-screen bg-background"><BlogHeader /><main className="container mx-auto max-w-3xl px-4 py-24 text-center"><p className="font-serif text-4xl">Story not found</p><p className="mt-3 text-muted-foreground">This story may have moved, but there are plenty more ideas in the feed.</p><Button onClick={() => navigate('/')} className="mt-6 rounded-full">Back to Feed</Button></main></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader />
      <main>
        <section className="border-b border-border/60 bg-card/50">
          <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8 rounded-full pl-2 text-muted-foreground hover:bg-secondary hover:text-foreground"><ArrowLeft className="mr-2 h-4 w-4" /> Back to stories</Button>
            <div className="mb-5 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-primary"><span className="rounded-full bg-primary/10 px-3 py-1.5">{story.category}</span><span className="inline-flex items-center gap-1.5 text-muted-foreground"><Clock3 className="h-3.5 w-3.5" /> {story.readTime} read</span></div>
            <h1 className="max-w-4xl text-balance text-5xl font-semibold leading-[0.98] sm:text-6xl lg:text-7xl">{story.title}</h1>
            <p className="mt-6 max-w-3xl text-xl leading-8 text-muted-foreground">{story.excerpt}</p>
            <div className="mt-7 flex items-center gap-3 text-sm text-muted-foreground"><div className="grid h-10 w-10 place-items-center rounded-full bg-accent font-serif text-lg font-semibold text-accent-foreground">{story.author.charAt(0)}</div><div><p className="font-semibold text-foreground">{story.author}</p><p>{story.publishedAt}{story.persisted ? ' · Community blog' : ' · eBlogging editorial'}</p></div></div>
          </div>
        </section>

        <section className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12"><div className="relative aspect-[16/8] overflow-hidden rounded-[2rem] border border-border/60 shadow-2xl"><img src={story.image} alt="" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" /><div className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full bg-black/25 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm"><Sparkles className="h-3.5 w-3.5" /> {story.persisted ? 'Published by the community' : 'A story worth sitting with'}</div></div></section>

        <section className="container mx-auto grid max-w-5xl gap-10 px-4 pb-20 sm:px-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-16">
          <article className="min-w-0"><div className="prose prose-stone max-w-none dark:prose-invert prose-headings:font-serif prose-p:text-lg prose-p:leading-9"><p className="lead text-xl font-medium leading-9 text-foreground">{story.excerpt}</p>{story.quote && <blockquote>{story.quote}</blockquote>}{!story.persisted && <h2>Start with the question</h2>}{story.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{!story.persisted && <><h2>A practice worth trying</h2><p>Before you move on, write down the one idea from this story you want to carry into the next week. A small note is enough. Good reading becomes more useful when it changes what we notice.</p></>}</div><div className="mt-10 flex flex-wrap items-center gap-2 border-y border-border/60 py-4"><Button variant="ghost" onClick={handleLike} className={`rounded-full ${liked ? '!bg-blog-like-bg !text-blog-like hover:!bg-blog-like-bg hover:!text-blog-like focus:!text-blog-like active:!text-blog-like' : 'text-muted-foreground'}`}><Heart className={`mr-2 h-4 w-4 ${liked ? 'fill-current' : ''}`} /> {liked ? 'Liked' : 'Like story'}</Button><Button variant="ghost" onClick={handleSave} className={`rounded-full ${saved ? 'bg-secondary text-primary' : 'text-muted-foreground'}`}><Bookmark className={`mr-2 h-4 w-4 ${saved ? 'fill-current' : ''}`} /> {saved ? 'Saved' : 'Save'}</Button><Button variant="ghost" onClick={handleShare} className="rounded-full text-muted-foreground"><Share2 className="mr-2 h-4 w-4" /> Share</Button></div>{story.persisted && <div className="mt-8"><CommentSection postId={story.id} comments={comments} onAddComment={handleAddComment} onLikeComment={handleLikeComment} /></div>}</article>
          <aside className="lg:pt-2"><div className="sticky top-24 rounded-2xl border border-border/60 bg-card/70 p-5 shadow-card"><div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary"><BookOpen className="h-4 w-4" /> Keep reading</div><p className="text-sm leading-6 text-muted-foreground">Stories are better when they lead to another good question.</p>{relatedStories.length > 0 ? <div className="mt-5 space-y-4">{relatedStories.map((related) => <button key={related.id} onClick={() => navigate(`/story/${related.id}`)} className="group block text-left"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{related.category}</span><span className="mt-1 block font-serif text-lg font-semibold leading-tight transition-colors group-hover:text-primary">{related.title}</span><span className="mt-2 inline-flex items-center text-xs text-primary">Read next <ArrowRight className="ml-1 h-3 w-3" /></span></button>)}</div> : <Button onClick={() => navigate('/')} variant="outline" className="mt-5 w-full rounded-full">Explore Feed</Button>}</div></aside>
        </section>
      </main>
    </div>
  );
};

export default StoryDetail;
