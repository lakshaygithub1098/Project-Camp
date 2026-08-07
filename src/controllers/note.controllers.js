import mongoose from "mongoose";
import { Project } from "../models/project.models.js";
import { ProjectNote } from "../models/note.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

const getNotes = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const notes = await ProjectNote.find({
    project: new mongoose.Types.ObjectId(projectId),
  })
    .populate("createdBy", "username fullName avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, notes, "Notes fetched successfully"));
});

const createNote = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { content } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const note = await ProjectNote.create({
    project: new mongoose.Types.ObjectId(projectId),
    createdBy: new mongoose.Types.ObjectId(req.user._id),
    content,
  });

  const populated = await ProjectNote.findById(note._id).populate(
    "createdBy",
    "username fullName avatar",
  );

  return res
    .status(201)
    .json(new ApiResponse(201, populated, "Note created successfully"));
});

const getNoteById = asyncHandler(async (req, res) => {
  const { noteId } = req.params;

  const note = await ProjectNote.findById(noteId).populate(
    "createdBy",
    "username fullName avatar",
  );

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note fetched successfully"));
});

const updateNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const { content } = req.body;

  const note = await ProjectNote.findByIdAndUpdate(
    noteId,
    { content },
    { new: true },
  ).populate("createdBy", "username fullName avatar");

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note updated successfully"));
});

const deleteNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;

  const note = await ProjectNote.findByIdAndDelete(noteId);
  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note deleted successfully"));
});

export { getNotes, createNote, getNoteById, updateNote, deleteNote };
