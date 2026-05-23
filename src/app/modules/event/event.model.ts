// event.model.ts
import { model, Schema,  } from "mongoose";
import { IEvent, IPromotion, IReview } from "./event.interface";




// ═══════════════════════════════════════════════════════════════════
//  Schema
// ═══════════════════════════════════════════════════════════════════
const promotionSchema = new Schema<IPromotion>({
  title:               { type: String, required: true },
  description:         { type: String, default: '' },
  discount_percentage: { type: Number, default: 0 },
  valid_until:         { type: Date },
});



const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
      category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    date: { type: Date, required: true },
    time: { type: String, default: "" },
    // location: { type: String, default: "" },


    description: { type: String, default: "" },
    price: { type: Number, default: 0 },
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

// // ✅ isPast auto update — export এর আগে define করুন
// eventSchema.post("find", async function (docs: any[]) {
//   const now = new Date();
//   const expiredIds: any[] = [];

//   for (const doc of docs) {
//     if (!doc.isPast) {
//       const eventDateTime = new Date(doc.date);
//       if (doc.time) {
//         const [hours, minutes] = doc.time.split(":").map(Number);
//         eventDateTime.setHours(hours, minutes, 0, 0);
//       }
//       if (eventDateTime < now) {
//         expiredIds.push(doc._id);
//         doc.isPast = true;
//       }
//     }
//   }

//   // ✅ একসাথে সব update করুন — loop এ একটা একটা না
//   if (expiredIds.length > 0) {
//     await Event.updateMany(
//       { _id: { $in: expiredIds } },
//       { $set: { isPast: true } }
//     );
//   }
// });

// eventSchema.post("findOne", async function (doc: any) {
//   if (!doc || doc.isPast) return;

//   const now = new Date();
//   const eventDateTime = new Date(doc.date);

//   if (doc.time) {
//     const [hours, minutes] = doc.time.split(":").map(Number);
//     eventDateTime.setHours(hours, minutes, 0, 0);
//   }

//   if (eventDateTime < now) {
//     await Event.updateOne({ _id: doc._id }, { $set: { isPast: true } });
//     doc.isPast = true;
//   }
// });

export const Event = model<IEvent>("Event", eventSchema);


