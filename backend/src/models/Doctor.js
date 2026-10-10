export class Doctor {
  constructor({ id, name, title, department, experience, rating = 5.0, reviewsCount = 0, bio, image, createdAt = new Date() }) {
    this.id = id
    this.name = name
    this.title = title
    this.department = department
    this.experience = experience
    this.rating = rating
    this.reviewsCount = reviewsCount
    this.bio = bio
    this.image = image
    this.createdAt = createdAt
  }
}

export default Doctor
