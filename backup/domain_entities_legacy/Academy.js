/**
 * Academy Entity - Domain Model
 * Representa uma academia no sistema
 */
export class Academy {
  constructor({
    id,
    name,
    description,
    address,
    phone,
    email,
    website,
    logoURL,
    isActive = true,
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.address = address;
    this.phone = phone;
    this.email = email;
    this.website = website;
    this.logoURL = logoURL;
    this.isActive = isActive;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  /**
   * Verifica se a academia está ativa
   */
  isActiveAcademy() {
    return this.isActive;
  }

  /**
   * Atualiza os dados da academia
   */
  update(data) {
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        this[key] = data[key];
      }
    });
    this.updatedAt = new Date();
    return this;
  }

  /**
   * Converte para objeto plain JavaScript
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      address: this.address,
      phone: this.phone,
      email: this.email,
      website: this.website,
      logoURL: this.logoURL,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}