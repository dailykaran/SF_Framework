import { faker } from "@faker-js/faker";

export class CommonFakerData {

    static getFirstName(): string {
        return faker.person.firstName();
    }
    static getLastName(): string {
        return faker.person.lastName();
    }
    static getOrganizationName() {
        return capitalizeFirstLetter(faker.company.buzzNoun())
    }
    static getcurrentYear() {
        return `${faker.date.anytime().getFullYear() - 2}`;
    }

    static getMobileNumber(): string {
        return getPhoneNumber();
    }

    static getEmail(): string {
        return faker.internet.email();
    }
    static getAddress(): string {
        return faker.location.streetAddress();
    }

    static getCity(): string {
        return faker.location.city();
    }

    static getStreet(): string {
        return faker.location.street();
    }

    static getPinCode() {
        return faker.location.zipCode('######');
    }

    static getState(): string {
        return faker.location.state();
    }

    static getCountry(): string {
        return faker.location.country();
    }   
    static addressName(): string {
        return `${faker.location.countryCode()} ${faker.location.county()}`;
    }

    static getWebsite(): string {
        return faker.internet.url();
    }
    static getAwardName() {
        const awardName = faker.helpers.arrayElement(["Excellency Award", "Leadership Award", "Trailblazer Award", "Pioneer Award"])
        return awardName
    }

    static jobRole(): string {
        return faker.person.jobTitle();
    }

    static equipmentName(): string {
        return faker.commerce.productMaterial();
    }
    static getTagNames() {
        const techTerm = faker.hacker.noun();
        return techTerm;
    }
    static getLocationName() {
        const location = faker.location.street();
        return location;
    }
    static getcertificationTitle() {
        const title = faker.word.sample() + " " + faker.word.noun()
        return title;
    }
    static AssessmentTitle() {
        const assmtTitle = (faker.word.noun() + " " + faker.word.verb() + " " + faker.word.sample());
        return assmtTitle;

    }
    static generateQuestion() {
        const question = (faker.lorem.sentence({ min: 3, max: 4 }) + " ?")
        return question
    }
    static getCourseName(): string {
        const adjective = faker.hacker.adjective();
        const noun = faker.hacker.noun();
        const verb = faker.hacker.verb();
        return `${capitalizeFirstLetter(adjective)} ${capitalizeFirstLetter(noun)} ${capitalizeFirstLetter(verb)}`;
    }
    static getUserId(): string {
        //const currentDate = new Date();
        //const milliseconds = currentDate.getTime().toString();
        const fName = faker.person.firstName();
        const user = faker.internet.email({ firstName: fName })
        return user;
    }
    static getEmployeeid(): string {
        const employeeId = faker.string.numeric({ length: 4 });
        const formattedEmployeeId = `EMP-${employeeId}`;

        return formattedEmployeeId;
    }
    static getCertificationNumber(): string {
        const employeeId = faker.string.numeric({ length: 4 });
        const formattedEmployeeId = `CER-${employeeId}`;

        return formattedEmployeeId;
    }
    static getRandomSkill(): string {
        return faker.hacker.adjective();
    }
    static randomCityName(): string {
        return faker.person.jobArea();
    }
    static getSession(): string {
        const session = faker.person.jobDescriptor()
        return session
    }

    static getDuration() {
        return faker.date.future().getHours().toString();
    }

    static getDescription(): string {
        const description = faker.lorem.paragraph(1);
        return description;
    }
    static getCategory(): string {
        const category = capitalizeFirstLetter(faker.company.buzzVerb()) + " " + capitalizeFirstLetter(faker.company.buzzNoun())
        return category;
    }
    static getMaxseats() {
        return faker.number.int({ min: 20 })
    }

    static getPrice(): string {
        return faker.commerce.price()
    }

    static getMeetingUrl(): string {
        return faker.internet.url();

    }
    static getRandomTitle() {
        return (capitalizeFirstLetter(faker.hacker.noun()) + " " + capitalizeFirstLetter(faker.hacker.noun()));
    }
}


function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}



function getPhoneNumber(): string {
    const startDigit = Math.floor(Math.random() * 3) + 7;
    const restDigits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
    return `${startDigit}${restDigits}`;

}





export async function getRandomSeat() {
    const num = 100;
    const randomNumber = Math.floor(Math.random() * num) + 1;
    return randomNumber.toString();
}


export function gettomorrowDateFormatted(): string {
    const date = new Date();
    const month = String(date.getMonth() + 1)
    const day = String(date.getDate() + 1);
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

export function getCurrentDateFormatted(): string {
    const date = new Date();
    const month = String(date.getMonth() + 1)
    const day = String(date.getDate())
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}


export function getPastDate(): string {

    const date = new Date();
    date.setDate(date.getDate() - 5);
    date.setMonth(date.getMonth() - 2);
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is zero-based
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear() - 4);
    return `${month}/${day}/${year}`;
}

export function getFutureDate(): string {

    const date = new Date();
    date.setDate(date.getDate() + 3);
    date.setMonth(date.getMonth() + 7);
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is zero-based
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear() + 3);
    return `${month}/${day}/${year}`;
}



export function getFutureyear(): string {
    const date = new Date();
    date.setDate(date.getDate() - 2);
    date.setMonth(date.getMonth() - 2);
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is zero-based
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear() + 4);
    return `${month}/${day}/${year}`;
}


export function getnextMonthFormatted(): string {
    const date = new Date();
    const month = String(date.getMonth() + 2) // getMonth() is zero-based
    const day = String(date.getDate() + 2)
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}





