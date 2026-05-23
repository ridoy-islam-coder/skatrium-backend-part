// event.model.ts
import { model, Schema,  } from "mongoose";
import { IEvent, IPromotion,  } from "./event.interface";




// ═══════════════════════════════════════════════════════════════════
//  Schema
// ═══════════════════════════════════════════════════════════════════
const promotionSchema = new Schema<IPromotion>({
  title:               { type: String, required: true },
  description:         { type: String, default: '' },
  discount_percentage: { type: String, default: '' },
  last_date:         { type: Date },
  lest_time:         { type: String },
});



const eventSchema = new Schema<IEvent>(
  {
    eventtitle: {  type: Schema.Types.ObjectId,ref: 'Business',required: true,},
    eventsubtitle: {  type: Schema.Types.ObjectId,ref: 'Business',required: true,},

      businessID: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    date: { type: Date, required: true },
    time: { type: String, default: "" },
  


    description: { type: String, default: "" },
   
    coverImage: {
      id: { type: String, default: "" },
      url: { type: String, default: "" },
    },
    gallery: [
      {
        id: { type: String },
        url: { type: String },
      },
    ],
    host: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isPast: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    promotions:          [promotionSchema],
    
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


eventSchema.index({ location: "2dsphere" });

// ── filter deleted ────────────────────────────────────────
eventSchema.pre("find", function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

eventSchema.pre("findOne", function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

export const Event = model<IEvent>("Event", eventSchema);


