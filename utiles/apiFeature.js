class APIFeature {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // 1. Filtering
  filter() {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const queryObj = { ...this.queryString };
    const excludedFields = ['sort', 'page', 'limit', 'field'];
    excludedFields.forEach((ele) => delete queryObj[ele]);

    // Advance searching
    const queryStr = JSON.stringify(queryObj).replace(/\bgt|gte|lt|lte\b/g, (match) => `$${match}`);
    // this.query = Products.find(JSON.parse(queryStr))
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  // 2. Sorting
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('topCategory');
    }

    return this;
  }

  // 3. Limiting fields
  limitFields() {
    if (this.queryString.field) {
      const fields = this.queryString.field.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  // 4. Pagination
  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit); // 1: 1-10, 2: 11-20, 3: 21-30

    return this;
  }
}

module.exports = APIFeature;
