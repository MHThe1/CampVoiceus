import Group from "../models/group.model.mjs";
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { GroupThread } from '../models/index.mjs'
// Create a new group
export const createGroup = async (req, res) => {
    try {
      const { name, description } = req.body;
  
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const userId = decoded.id;
  
      const newGroup = new Group({
        name,
        description,
        createdBy: userId, // Populate createdBy with user ID
        members: [userId], // Add the creator as the first member
      });
  
      await newGroup.save();
      res.status(201).json({ message: "Group created successfully", group: newGroup });
    } catch (error) {
      console.error("Error creating group:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

// Fetch all groups
export const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find();
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
};

// Fetch groups joined by the current user
export const getJoinedGroups = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming `requireAuth` middleware adds the `user` object
    const groups = await Group.find({ members: userId });
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching joined groups:", error);
    res.status(500).json({ error: "Failed to fetch joined groups" });
  }
};

// Join a group
export const joinGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;
    const group = await Group.findById(groupId);

    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }

    res.status(200).json({ message: "Joined group successfully" });
  } catch (error) {
    console.error("Error joining group:", error);
    res.status(500).json({ error: "Failed to join group" });
  }
};

// Leave a group
export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;
    const group = await Group.findById(groupId);

    group.members = group.members.filter((member) => member.toString() !== userId.toString());
    await group.save();

    res.status(200).json({ message: "Left group successfully" });
  } catch (error) {
    console.error("Error leaving group:", error);
    res.status(500).json({ error: "Failed to leave group" });
  }
};




export async function createThread(req, res) {
  try {
      const { title, content, groupId } = req.body; // Extract groupId from the request body
      const file = req.file;

      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
          return res.status(401).json({ error: "Token missing" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const authorId = decoded.id;

      // Construct thread data
      const threadData = { 
          title, 
          content, 
          authorId, 
          groupId: groupId || null // Include groupId if provided, or null if not
      };

      if (file) {
          threadData.file = {
              name: file.originalname,
              contentType: file.mimetype,
              data: file.buffer,
          };
      }

      const newThread = new GroupThread(threadData); // Save the thread
      await newThread.save();

      res.status(201).json({
          message: 'Thread created successfully',
          thread: newThread, // Optionally return the created thread
      });
  } catch (error) {
      console.error('Error in createThread:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
}

export async function homeThreads(req, res) {
    try {
        const threads = await GroupThread.find().sort({ createdAt: -1 });;
        res.status(200).json(threads);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch threads" });
    }
}

export async function getThreadById(req, res){
    try {
        const { id } = req.body;
        
        if (!id) {
          return res.status(400).json({ error: 'Thread ID is required' });
        }
    
        const thread = await GroupThread.findById(id);
    
        if (!thread) {
          return res.status(404).json({ error: 'Thread not found' });
        }
    
        res.status(200).json({ thread });
    } catch (error) {
        console.error('Error fetching thread:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function fileDownload(req, res) {
    try {
        const { threadId } = req.body;
        
        const thread = await GroupThread.findById(threadId);
        const file = thread.file;
        if (!file) return res.status(404).json({ error: 'File not found' });
        res.set({
            'Content-Type': file.contentType,
            'Content-Disposition': `attachment; filename="${file.name}"`,
        });
        res.send(file.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to download file' });
    }
};

export async function upvote(req, res) {
    const { upvoter, threadId } = req.body;
    
    const decoded = jwt.verify(upvoter, process.env.JWT_SECRET_KEY);
    const upvoterId = decoded.id;

    if (!upvoterId) {
        return res.status(400).json({ error: 'User name is required for upvoting' });
    }

    try {
        const thread = await GroupThread.findById(threadId);

        if (!thread) {
            return res.status(404).json({ error: 'Thread not found' });
        }

        if (thread.upvotes.includes(upvoterId)) {
            return res.status(400).json({ error: 'User has already upvoted this thread' });
        }

        thread.downvotes = thread.downvotes.filter((id) => id !== upvoterId);

        thread.upvotes.push(upvoterId);

        await thread.save();

        return res.status(200).json({ message: 'Upvoted successfully', updatedThread : thread });
    } catch (error) {
        console.error('Error handling upvote:', error);
        return res.status(500).json({ error: 'An error occurred while upvoting' });
    }
}

export async function downvote(req, res) {
    const { downvoter, threadId } = req.body;
    
    const decoded = jwt.verify(downvoter, process.env.JWT_SECRET_KEY);
    const downvoterId = decoded.id;

    if (!downvoterId) {
        return res.status(400).json({ error: 'User name is required for upvoting' });
    }

    try {
        const thread = await GroupThread.findById(threadId);

        if (!thread) {
            return res.status(404).json({ error: 'Thread not found' });
        }

        if (thread.downvotes.includes(downvoterId)) {
            return res.status(400).json({ error: 'User has already upvoted this thread' });
        }

        thread.upvotes = thread.upvotes.filter((id) => id !== downvoterId);

        thread.downvotes.push(downvoterId);

        await thread.save();

        return res.status(200).json({ message: 'Upvoted successfully', updatedThread : thread });
    } catch (error) {
        console.error('Error handling upvote:', error);
        return res.status(500).json({ error: 'An error occurred while upvoting' });
    }
}

export async function comment(req, res) {
    const { threadId, content, token } = req.body;

    if (!threadId || !content || !token) {
        return res.status(400).json({ error: 'Thread ID, content, and token are required.' });
    }

    try {
        // Decode the token to extract user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.id;

        if (!userId) {
            return res.status(401).json({ error: 'Invalid token or user not authorized.' });
        }

        // Find the thread by ID
        const thread = await GroupThread.findById(threadId);
        if (!thread) {
            return res.status(404).json({ error: 'Thread not found.' });
        }

        // Create a new comment
        const newComment = {
            userId,
            content,
            upvotes: [],
            downvotes: [],
            createdAt: new Date(),
        };

        // Add the comment to the thread
        thread.comments.push(newComment);

        // Save the thread
        await thread.save();

        // Send back the updated thread
        return res.status(200).json({ message: 'Comment added successfully.', thread });
    } catch (error) {
        console.error('Error adding comment:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token.' });
        }
        return res.status(500).json({ error: 'Internal server error.' });
    }
};



export async function upvoteComment(req, res) {
    const { upvoter, threadId, commentId } = req.body;

    const decoded = jwt.verify(upvoter, process.env.JWT_SECRET_KEY);
    const userId = decoded.id;

    if (!userId || !threadId || !commentId) {
        return res.status(400).json({ message: 'userId, threadId, and commentId are required.' });
    }

    try {
        // Find the thread containing the comment
        const thread = await GroupThread.findById(threadId);
        if (!thread) {
            return res.status(404).json({ message: 'Thread not found.' });
        }

        // Locate the comment in the thread
        const comment = thread.comments.find((c) => c.commentId.equals(new mongoose.Types.ObjectId(commentId)));
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        // Check if user has already upvoted the comment
        if (comment.upvotes.includes(userId)) {
            return res.status(400).json({ message: 'You have already upvoted this comment.' });
        }

        // Remove userId from downvotes if present
        comment.downvotes = comment.downvotes.filter((id) => id !== userId);

        // Add userId to upvotes
        comment.upvotes.push(userId);

        // Save the updated thread document
        await thread.save();

        return res.status(200).json({ message: 'Comment upvoted successfully.', updatedComment: comment });
    } catch (error) {
        console.error('Error upvoting comment:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

export async function downvoteComment(req, res) {
    const { downvoter, threadId, commentId } = req.body;

    const decoded = jwt.verify(downvoter, process.env.JWT_SECRET_KEY);
    const userId = decoded.id;

    if (!userId || !threadId || !commentId) {
        return res.status(400).json({ message: 'userId, threadId, and commentId are required.' });
    }

    try {
        // Find the thread containing the comment
        const thread = await GroupThread.findById(threadId);
        if (!thread) {
            return res.status(404).json({ message: 'Thread not found.' });
        }

        // Locate the comment in the thread
        const comment = thread.comments.find((c) => c.commentId.equals(new mongoose.Types.ObjectId(commentId)));
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        // Check if user has already downvoted the comment
        if (comment.downvotes.includes(userId)) {
            return res.status(400).json({ message: 'You have already downvoted this comment.' });
        }

        // Remove userId from upvotes if present
        comment.upvotes = comment.upvotes.filter((id) => id !== userId);

        // Add userId to upvotes
        comment.downvotes.push(userId);

        // Save the updated thread document
        await thread.save();

        return res.status(200).json({ message: 'Comment upvoted successfully.', updatedComment: comment });
    } catch (error) {
        console.error('Error upvoting comment:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

export async function getUserThreads(req, res) {
    const { userId } = req.params;

    try {
        const threads = await GroupThread.find({ authorId: userId }).sort({ createdAt: -1 });
        res.status(200).json(threads);
    } catch (error) {
        console.error('Error fetching user threads:', error);
        res.status(500).json({ error: 'An error occurred while fetching user threads' });
    }
}
