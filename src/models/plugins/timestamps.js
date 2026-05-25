export function timestampsPlugin(schema) {
  schema.add({
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });
  schema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
  });
}

export function softDeletePlugin(schema) {
  schema.add({ deletedAt: { type: Date, default: null } });
  schema.methods.softDelete = function () {
    this.deletedAt = new Date();
    return this.save();
  };
  schema.query.notDeleted = function () {
    return this.where({ deletedAt: null });
  };
}
