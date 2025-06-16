export const pagination = (itemsPerPage, data, page) => {
  const lastIndex = page * itemsPerPage;
  const startIndex = lastIndex - itemsPerPage;

  // get all pages
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginatedData = data.slice(startIndex, lastIndex);

  return { totalPages, paginatedData };
};
