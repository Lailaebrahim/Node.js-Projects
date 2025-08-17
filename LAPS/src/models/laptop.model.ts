import mongoose from "mongoose";
import manualFileProcessingQueue from "../queues/manualFileProcessingQueue.js";
import manualFileDeletionQueue from "../queues/manualFileDeletionQueue.js";

export const laptopSchema = new mongoose.Schema(
  {
    model_name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: [3, "Model name must be at least 3 characters long"],
      maxlength: [100, "Model name must be less than 100 characters long"],
    },
    brand: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "Brand name must be at least 2 characters long"],
      maxlength: [100, "Brand name must be less than 100 characters long"],
    },
    processor_name: {
      type: String,
      required: true,
    },
    ram: {
      type: Number,
      required: true,
    },
    ssd: {
      type: Number,
      required: true,
    },
    hard_disk: {
      type: Number,
      required: true,
    },
    operating_system: {
      type: String,
      required: true,
    },
    graphics: {
      type: String,
      required: true,
    },
    screen_size_inches: {
      type: Number,
      required: true,
    },
    resolution_pixels: {
      type: String,
      required: true,
    },
    no_of_cores: {
      type: Number,
      required: true,
    },
    no_of_threads: {
      type: Number,
      required: true,
    },
    spec_score: {
      type: Number,
      required: true,
      select: false, // exclude from default queries
    },
    price: {
      type: Number,
      required: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
    manual: {
      fileName: {
        type: String
      },
      vectorized: {
        type: Boolean,
      },
    },
  },
  {
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: function (doc, ret) {
        delete (ret as any).id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

laptopSchema.virtual("processorGeneration").get(function () {
  const processorName = this.processor_name.toLowerCase();
  const generationMatch = processorName.match(/(\d+)/);
  return generationMatch ? parseInt(generationMatch[0], 10) : null;
});

// customm method for adding file deletion job
laptopSchema.methods.triggerFileDeletion = async function() {
console.log("manually triggering file deletion");
    await manualFileDeletionQueue.add("file-deletion", {
      fileName: this.manual.fileName,
      ID: this._id,
    });
    return { success: true, fileName: this.manual.fileName };
};

// Document Middleware: (pre --> runs before) doc.save() and model.create() and runs in the order added
laptopSchema.pre("save", function (next) {
  if (this.manual?.fileName) {
    // console.log("adding job to processing queue");
    manualFileProcessingQueue.add("file-processing", {
      fileName: this.manual.fileName,
      ID: this._id,
    });
  }
  next();
});

// Query Middleware: (pre --> runs before) find, findOne, findById, etc. and runs in the order added
laptopSchema.pre(/^find/, function (next) {
  (this as any).find({ available: true });
  next();
});

// Aggregation Middleware: (pre --> runs before) aggregate() and runs in the order added
laptopSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { available: true } });
  next();
});

laptopSchema.pre("deleteOne", async function (next) {
  // 'this' refers to the query, not the document so using it to get the document
  const doc = await this.model.findOne(this.getQuery());
  
  if (doc && doc.manual) {
    // console.log("adding job to file deletion queue");
    manualFileDeletionQueue.add("file-deletion", {
      fileName: doc.manual.fileName,
      ID: doc._id,
    });
  }
  next();
});

const Laptop = mongoose.model("Laptop", laptopSchema);
export default Laptop;
