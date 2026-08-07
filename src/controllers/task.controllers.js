import mongoose from "mongoose";
import { Project } from "../models/project.models.js";
import { Task } from "../models/task.models.js";
import { Subtask } from "../models/subtask.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { TaskStatusEnum } from "../utils/constants.js";

const getTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  const tasks = await Task.find({
    project: new mongoose.Types.ObjectId(projectId),
  }).populate("assignedTo", "avatar username fullName");

  return res
    .status(200)
    .json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
});

const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, status, priority, dueDate } = req.body;
  const { projectId } = req.params;
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const files = req.files || [];

  const attachments = files.map((file) => {
    // Multer stores files as `Date.now() - originalname` (space-padded).
    // Our build uses the original name for the URL; pick the stored filename.
    const storedName = file.filename ?? file.originalname;
    return {
      url: `${process.env.SERVER_URL}/images/${storedName}`,
      mimetype: file.mimetype,
      size: file.size,
    };
  });

  const task = await Task.create({
    title,
    description,
    project: new mongoose.Types.ObjectId(projectId),
    assignedTo: assignedTo
      ? new mongoose.Types.ObjectId(assignedTo)
      : undefined,
    status: status ?? TaskStatusEnum.TODO,
    assignedBy: new mongoose.Types.ObjectId(req.user._id),
    priority: priority ?? undefined,
    dueDate: dueDate ?? undefined,
    attachments,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, task, "Task created successfully"));
});

const getTaskById = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(taskId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedTo",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "subtasks",
        localField: "_id",
        foreignField: "task",
        as: "subtasks",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "createdBy",
              foreignField: "_id",
              as: "createdBy",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              createdBy: {
                $arrayElemAt: ["$createdBy", 0],
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        assignedTo: {
          $arrayElemAt: ["$assignedTo", 0],
        },
      },
    },
  ]);

  if (!task || task.length === 0) {
    throw new ApiError(404, "Task not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, task[0], "Task fetched successfully"));
});

const updateTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const { title, description, assignedTo, status, priority, dueDate } = req.body;

  const task = await Task.findOne({
    _id: new mongoose.Types.ObjectId(taskId),
    project: new mongoose.Types.ObjectId(projectId),
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate || null;
  if (assignedTo !== undefined) {
    task.assignedTo = assignedTo
      ? new mongoose.Types.ObjectId(assignedTo)
      : null;
  }

  const files = req.files || [];
  if (files.length > 0) {
    const newAttachments = files.map((file) => {
      const storedName = file.filename ?? file.originalname;
      return {
        url: `${process.env.SERVER_URL}/images/${storedName}`,
        mimetype: file.mimetype,
        size: file.size,
      };
    });
    task.attachments = [...task.attachments, ...newAttachments];
  }

  await task.save();

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task updated successfully"));
});

const deleteTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;

  const task = await Task.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(taskId),
    project: new mongoose.Types.ObjectId(projectId),
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Clean up subtasks belonging to this task.
  await Subtask.deleteMany({
    task: new mongoose.Types.ObjectId(taskId),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task deleted successfully"));
});

const createSubTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const { title } = req.body;

  const task = await Task.findOne({
    _id: new mongoose.Types.ObjectId(taskId),
    project: new mongoose.Types.ObjectId(projectId),
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const subtask = await Subtask.create({
    title,
    task: new mongoose.Types.ObjectId(taskId),
    createdBy: new mongoose.Types.ObjectId(req.user._id),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, subtask, "Subtask created successfully"));
});

const updateSubTask = asyncHandler(async (req, res) => {
  const { subTaskId } = req.params;
  const { title, isCompleted } = req.body;

  const subtask = await Subtask.findById(subTaskId);
  if (!subtask) {
    throw new ApiError(404, "Subtask not found");
  }

  if (title !== undefined) subtask.title = title;
  if (isCompleted !== undefined) subtask.isCompleted = isCompleted;

  await subtask.save();

  return res
    .status(200)
    .json(new ApiResponse(200, subtask, "Subtask updated successfully"));
});

const deleteSubTask = asyncHandler(async (req, res) => {
  const { subTaskId } = req.params;

  const subtask = await Subtask.findByIdAndDelete(subTaskId);
  if (!subtask) {
    throw new ApiError(404, "Subtask not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, subtask, "Subtask deleted successfully"));
});

export {
  createSubTask,
  createTask,
  deleteTask,
  deleteSubTask,
  getTaskById,
  getTasks,
  updateSubTask,
  updateTask,
};
