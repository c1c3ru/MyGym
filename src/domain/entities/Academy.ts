/**
 * Academy Domain Entity
 * Representa uma academia no sistema
 */

export interface AcademyProps {
    id: string;
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    logoURL?: string;
    isActive?: boolean;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

export class Academy {
    id: string;
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    logoURL?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;

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
    }: AcademyProps) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.address = address;
        this.phone = phone;
        this.email = email;
        this.website = website;
        this.logoURL = logoURL;
        this.isActive = isActive;
        this.createdAt = createdAt ? new Date(createdAt) : new Date();
        this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();
    }

    /**
     * Verifica se a academia está ativa
     */
    isActiveAcademy(): boolean {
        return this.isActive;
    }

    /**
     * Atualiza os dados da academia
     */
    update(data: Partial<AcademyProps>): Academy {
        Object.keys(data).forEach(key => {
            const typedKey = key as keyof AcademyProps;
            if (data[typedKey] !== undefined) {
                // @ts-ignore - Dynamic assignment
                this[typedKey] = data[typedKey];
            }
        });
        this.updatedAt = new Date();
        return this;
    }

    /**
     * Converte para objeto plain JavaScript
     */
    toJSON(): AcademyProps {
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
