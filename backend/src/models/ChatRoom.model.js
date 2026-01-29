import mongoose from 'mongoose';

const chatRoomSchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },

    visitor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Visitor',
      required: true,
    },

    assigned_agent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CompanyUser',
      default: null,
    },

    status: {
      type: String,
      enum: ['waiting', 'active', 'closed'],
      default: 'waiting',
    },

    room_id: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);
