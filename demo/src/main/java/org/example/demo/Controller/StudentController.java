package org.example.demo.Controller;

import org.example.demo.Services.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/students")
@CrossOrigin
public class StudentController {

    @Autowired
    private StudentService studentService;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file, @RequestParam String adminEmail) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty. Please upload a valid file.");
        }

        String fileType = file.getContentType();
        if (fileType == null ||
                (!fileType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") &&
                        !fileType.equals("application/vnd.ms-excel"))) {
            return ResponseEntity.badRequest().body("Invalid file type. Please upload an Excel file (.xlsx or .xls).");
        }

        try {

            studentService.saveStudentsFromExcel(file, adminEmail);


            return ResponseEntity.ok("File uploaded successfully and processed.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error uploading file: " + e.getMessage());
        }
    }

}