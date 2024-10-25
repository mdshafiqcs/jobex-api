

export const pagenateOption = (currentPage = 1, limit = 10, label = "items") => {
  return {
    page: currentPage, 
    limit, 
    pagination: true,
    customLabels: {
      docs: label,
      totalDocs: "itemCount"
    }
  }
}