// Shared JSON settings for every model.
// MongoDB adds "_id" and "__v" to each document. Our API uses its own
// "id" field instead, so we hide those two when sending data to the client.

function toJSONOptions(extraHiddenFields = []) {
  return {
    versionKey: false,
    transform(doc, ret) {
      delete ret._id;
      extraHiddenFields.forEach((field) => delete ret[field]);
      return ret;
    },
  };
}

module.exports = toJSONOptions;
